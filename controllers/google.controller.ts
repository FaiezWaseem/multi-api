import type { NextFunction, Request, Response } from "express";

import { createSuccessResponse } from "../lib/api-response";
import { AppError } from "../lib/app-error";
import { getGoogleSearchResults } from "../services/google.service";
import {
  getGoogleSearchSchema,
  postGoogleSearchSchema,
} from "../validations/search.validation";

export async function getGoogleSearchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { query, limit, region, response_type, cursor } = getGoogleSearchSchema.parse(req.query);
    const payload = await getGoogleSearchResults(query, limit, region, response_type, cursor, undefined, {
      userId: req.apiConsumer?.id,
      apiTokenId: req.apiConsumer?.tokenId,
      ipAddress: req.ip,
      userAgent: req.header("user-agent") ?? null,
    });

    res.status(200).json(createSuccessResponse("Google search completed successfully", payload));
  } catch (error) {
    next(error);
  }
}

export async function postGoogleSearchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { query, limit, region, response_type, cursor, proxy } = postGoogleSearchSchema.parse({
      ...req.body,
      limit: req.body?.limit ?? req.query.limit,
      region: req.body?.region ?? req.query.region,
      response_type: req.body?.response_type ?? req.query.response_type,
      cursor: req.body?.cursor ?? req.query.cursor,
    });

    if (proxy && !req.apiConsumer) {
      throw new AppError("Custom proxy is only available for authenticated x-api-token requests.", 403);
    }

    const payload = await getGoogleSearchResults(query, limit, region, response_type, cursor, proxy, {
      userId: req.apiConsumer?.id,
      apiTokenId: req.apiConsumer?.tokenId,
      ipAddress: req.ip,
      userAgent: req.header("user-agent") ?? null,
    });

    res.status(200).json(createSuccessResponse("Google search completed successfully", payload));
  } catch (error) {
    next(error);
  }
}
