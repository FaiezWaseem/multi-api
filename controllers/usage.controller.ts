import type { Request, Response } from "express";

import { createErrorResponse, createSuccessResponse } from "../lib/api-response";
import { getUsageSnapshot } from "../middlewares/rate-limit";

export function getUsageController(req: Request, res: Response) {
  if (req.apiTokenInvalid) {
    res.status(401).json(createErrorResponse("Invalid x-api-token.", 401));
    return;
  }

  const usage = getUsageSnapshot(req);

  res.status(200).json(createSuccessResponse("Usage fetched successfully", usage));
}
