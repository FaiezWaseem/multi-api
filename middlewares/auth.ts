import type { NextFunction, Request, Response } from "express";

import { createErrorResponse } from "../lib/api-response";
import { getApiConsumerFromToken, getUserFromSessionToken } from "../services/auth.service";

function getBearerToken(req: Request) {
  const authorization = req.header("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export function requireAuthSession(req: Request, res: Response, next: NextFunction) {
  const sessionToken = getBearerToken(req);

  if (!sessionToken) {
    res.status(401).json(createErrorResponse("Authorization bearer token is required.", 401));
    return;
  }

  const authUser = getUserFromSessionToken(sessionToken);

  if (!authUser) {
    res.status(401).json(createErrorResponse("Invalid or expired session token.", 401));
    return;
  }

  req.authUser = authUser;
  next();
}

export function requireAuthSessionOrApiToken(req: Request, res: Response, next: NextFunction) {
  const sessionToken = getBearerToken(req);

  if (sessionToken) {
    const authUser = getUserFromSessionToken(sessionToken);

    if (!authUser) {
      res.status(401).json(createErrorResponse("Invalid or expired session token.", 401));
      return;
    }

    req.authUser = authUser;
    next();
    return;
  }

  if (req.apiTokenInvalid) {
    res.status(401).json(createErrorResponse("Invalid x-api-token.", 401));
    return;
  }

  if (req.apiConsumer) {
    req.authUser = {
      id: req.apiConsumer.id,
      email: req.apiConsumer.email,
      isPaid: req.apiConsumer.tier === "paid",
    };
    next();
    return;
  }

  res
    .status(401)
    .json(createErrorResponse("Authorization bearer token or x-api-token is required.", 401));
}

export function attachApiConsumer(req: Request, _res: Response, next: NextFunction) {
  const apiToken = req.header("x-api-token");

  if (!apiToken) {
    req.apiConsumer = undefined;
    req.apiTokenInvalid = false;
    next();
    return;
  }

  const apiConsumer = getApiConsumerFromToken(apiToken);

  if (!apiConsumer) {
    req.apiConsumer = undefined;
    req.apiTokenInvalid = true;
  } else {
    req.apiConsumer = apiConsumer;
    req.apiTokenInvalid = false;
  }

  next();
}
