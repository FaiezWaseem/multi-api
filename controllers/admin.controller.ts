import type { Request, Response } from "express";

import { createErrorResponse, createSuccessResponse } from "../lib/api-response";
import { getAdminMetrics, getAdminRequestLogs } from "../services/admin.service";

function getLimit(req: Request) {
  const raw = Number(req.query.limit ?? 100);

  if (!Number.isFinite(raw) || raw < 1) {
    return 100;
  }

  return Math.min(500, Math.trunc(raw));
}

export function getAdminMetricsController(req: Request, res: Response) {
  if (!req.authUser?.isAdmin) {
    res.status(403).json(createErrorResponse("Admin access is required.", 403));
    return;
  }

  res.status(200).json(createSuccessResponse("Admin metrics fetched successfully", getAdminMetrics()));
}

export function getAdminRequestLogsController(req: Request, res: Response) {
  if (!req.authUser?.isAdmin) {
    res.status(403).json(createErrorResponse("Admin access is required.", 403));
    return;
  }

  res
    .status(200)
    .json(createSuccessResponse("Admin request logs fetched successfully", getAdminRequestLogs(getLimit(req))));
}
