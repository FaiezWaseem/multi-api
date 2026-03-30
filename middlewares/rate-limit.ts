import type { NextFunction, Request, Response } from "express";

import { createErrorResponse } from "../lib/api-response";

type AccountTier = "free" | "auth" | "paid";

type TierLimit = {
  perMinute: number;
  perDay: number;
};

type CounterRecord = {
  count: number;
  resetAt: number;
};

type CounterUsage = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const minuteWindowMs = 60 * 1000;
const dayWindowMs = 24 * 60 * 60 * 1000;
const tierLimits: Record<AccountTier, TierLimit> = {
  free: {
    perMinute: 2,
    perDay: 25,
  },
  auth: {
    perMinute: 20,
    perDay: 100,
  },
  paid: {
    perMinute: 100,
    perDay: 1000,
  },
};

const minuteCounters = new Map<string, CounterRecord>();
const dayCounters = new Map<string, CounterRecord>();

function normalizeTier(value: string | undefined): AccountTier {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === "auth" || normalizedValue === "paid") {
    return normalizedValue;
  }

  return "free";
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0]?.trim() ?? req.ip ?? "unknown";
  }

  return req.ip ?? "unknown";
}

function getRequestTier(req: Request): AccountTier {
  return normalizeTier(req.apiConsumer?.tier);
}

function getRequestIdentity(req: Request) {
  const ip = getClientIp(req);
  return req.apiConsumer ? `user:${req.apiConsumer.id}` : `ip:${ip}`;
}

function getCounterUsage(
  counters: Map<string, CounterRecord>,
  key: string,
  maxRequests: number,
): CounterUsage {
  const now = Date.now();
  const existingRecord = counters.get(key);

  if (!existingRecord || existingRecord.resetAt <= now) {
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: now,
    };
  }

  return {
    allowed: existingRecord.count < maxRequests,
    remaining: Math.max(0, maxRequests - existingRecord.count),
    resetAt: existingRecord.resetAt,
  };
}

function consumeCounter(
  counters: Map<string, CounterRecord>,
  key: string,
  maxRequests: number,
  windowMs: number,
): CounterUsage {
  const now = Date.now();
  const existingRecord = counters.get(key);

  if (!existingRecord || existingRecord.resetAt <= now) {
    const nextRecord = {
      count: 1,
      resetAt: now + windowMs,
    };

    counters.set(key, nextRecord);

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - nextRecord.count),
      resetAt: nextRecord.resetAt,
    };
  }

  if (existingRecord.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existingRecord.resetAt,
    };
  }

  existingRecord.count += 1;

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existingRecord.count),
    resetAt: existingRecord.resetAt,
  };
}

function releaseCounter(counters: Map<string, CounterRecord>, key: string) {
  const existingRecord = counters.get(key);

  if (!existingRecord) {
    return;
  }

  existingRecord.count -= 1;

  if (existingRecord.count <= 0) {
    counters.delete(key);
  }
}

function setRateLimitHeaders(
  res: Response,
  prefix: string,
  limit: number,
  remaining: number,
  resetAt: number,
) {
  res.setHeader(`${prefix}-limit`, String(limit));
  res.setHeader(`${prefix}-remaining`, String(remaining));
  res.setHeader(`${prefix}-reset`, String(Math.max(0, Math.ceil((resetAt - Date.now()) / 1000))));
}

export function searchRateLimiter(req: Request, res: Response, next: NextFunction) {
  const tier = getRequestTier(req);
  const limits = tierLimits[tier];
  const identity = getRequestIdentity(req);
  const counterKey = `${tier}:${identity}`;
  const minuteKey = `${counterKey}:minute`;
  const dayKey = `${counterKey}:day`;

  const minuteUsage = consumeCounter(
    minuteCounters,
    minuteKey,
    limits.perMinute,
    minuteWindowMs,
  );
  const dayUsage = consumeCounter(
    dayCounters,
    dayKey,
    limits.perDay,
    dayWindowMs,
  );

  res.setHeader("x-account-tier", tier);
  setRateLimitHeaders(res, "x-ratelimit-minute", limits.perMinute, minuteUsage.remaining, minuteUsage.resetAt);
  setRateLimitHeaders(res, "x-ratelimit-day", limits.perDay, dayUsage.remaining, dayUsage.resetAt);

  if (req.apiTokenInvalid) {
    releaseCounter(minuteCounters, minuteKey);
    releaseCounter(dayCounters, dayKey);
    res.status(401).json(createErrorResponse("Invalid x-api-token.", 401));
    return;
  }

  if (!minuteUsage.allowed) {
    releaseCounter(dayCounters, dayKey);
    res
      .status(429)
      .json(
        createErrorResponse(
          `Rate limit exceeded for ${tier} tier: maximum ${limits.perMinute} requests per minute.`,
          429,
          {
            tier,
            identity,
            window: "minute",
            limit: limits.perMinute,
          },
        ),
      );
    return;
  }

  if (!dayUsage.allowed) {
    releaseCounter(minuteCounters, minuteKey);
    res
      .status(429)
      .json(
        createErrorResponse(
          `Rate limit exceeded for ${tier} tier: maximum ${limits.perDay} requests per day.`,
          429,
          {
            tier,
            identity,
            window: "day",
            limit: limits.perDay,
          },
        ),
      );
    return;
  }

  next();
}

export function getUsageSnapshot(req: Request) {
  const tier = getRequestTier(req);
  const limits = tierLimits[tier];
  const identity = getRequestIdentity(req);
  const counterKey = `${tier}:${identity}`;
  const minuteUsage = getCounterUsage(minuteCounters, `${counterKey}:minute`, limits.perMinute);
  const dayUsage = getCounterUsage(dayCounters, `${counterKey}:day`, limits.perDay);

  return {
    tier,
    identity,
    authenticated: Boolean(req.apiConsumer),
    limits: {
      minute: limits.perMinute,
      day: limits.perDay,
    },
    usage: {
      minute: {
        used: limits.perMinute - minuteUsage.remaining,
        remaining: minuteUsage.remaining,
        resetInSeconds: Math.max(0, Math.ceil((minuteUsage.resetAt - Date.now()) / 1000)),
      },
      day: {
        used: limits.perDay - dayUsage.remaining,
        remaining: dayUsage.remaining,
        resetInSeconds: Math.max(0, Math.ceil((dayUsage.resetAt - Date.now()) / 1000)),
      },
    },
  };
}
