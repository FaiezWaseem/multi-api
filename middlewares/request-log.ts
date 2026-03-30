import type { NextFunction, Request, Response } from "express";

import { createRequestLog } from "../services/log.service";

function getClientIp(req: Request) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0]?.trim() ?? req.ip ?? "unknown";
  }

  return req.ip ?? "unknown";
}

export function requestLogMiddleware(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    createRequestLog({
      userId: req.apiConsumer?.id ?? req.authUser?.id ?? null,
      method: req.method,
      endpoint: req.originalUrl.split("?")[0] ?? req.path,
      statusCode: res.statusCode,
      ipAddress: getClientIp(req),
      userAgent: req.header("user-agent") ?? null,
    });
  });

  next();
}
