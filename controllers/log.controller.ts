import type { Request, Response } from "express";

import { createErrorResponse, createSuccessResponse } from "../lib/api-response";
import { listLoginLogsForUser, listSearchLogsForUser } from "../services/log.service";

function getLimit(req: Request) {
  const raw = Number(req.query.limit ?? 50);

  if (!Number.isFinite(raw) || raw < 1) {
    return 50;
  }

  return Math.min(100, Math.trunc(raw));
}

export function getSearchLogsController(req: Request, res: Response) {
  if (!req.authUser) {
    res.status(401).json(createErrorResponse("Unauthorized", 401));
    return;
  }

  const logs = listSearchLogsForUser(req.authUser.id, getLimit(req));
  res.status(200).json(createSuccessResponse("Search logs fetched successfully", logs));
}

export function getLoginLogsController(req: Request, res: Response) {
  if (!req.authUser) {
    res.status(401).json(createErrorResponse("Unauthorized", 401));
    return;
  }

  const logs = listLoginLogsForUser(req.authUser.id, getLimit(req));
  res.status(200).json(createSuccessResponse("Login logs fetched successfully", logs));
}
