import type { Request, Response } from "express";

import { createErrorResponse, createSuccessResponse } from "../lib/api-response";
import { adminCreditAdjustmentSchema, adminUserIdParamSchema } from "../validations/admin.validation";
import {
  addCreditsToUser,
  getAdminMetrics,
  getAdminRequestLogs,
  getAdminUsers,
} from "../services/admin.service";
import { adminViewHtml } from "../views/admin-view";

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

export function getAdminUsersController(req: Request, res: Response) {
  if (!req.authUser?.isAdmin) {
    res.status(403).json(createErrorResponse("Admin access is required.", 403));
    return;
  }

  res.status(200).json(createSuccessResponse("Admin users fetched successfully", getAdminUsers()));
}

export function addCreditsToUserController(req: Request, res: Response) {
  if (!req.authUser?.isAdmin) {
    res.status(403).json(createErrorResponse("Admin access is required.", 403));
    return;
  }

  const { id } = adminUserIdParamSchema.parse(req.params);
  const { amount, note } = adminCreditAdjustmentSchema.parse(req.body);
  const result = addCreditsToUser(req.authUser.id, id, amount, note);

  res.status(200).json(createSuccessResponse("Credits added successfully", result));
}

export function getAdminViewController(_req: Request, res: Response) {
  res.type("text/html").send(adminViewHtml);
}
