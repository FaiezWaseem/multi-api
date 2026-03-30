import type { NextFunction, Request, Response } from "express";

import { createSuccessResponse } from "../lib/api-response";
import { AppError } from "../lib/app-error";
import { getDuckDuckGoSearchResults } from "../services/duckduckgo.service";
import {
  getDuckDuckGoSearchSchema,
  postDuckDuckGoSearchSchema,
} from "../validations/search.validation";

export async function getDuckDuckGoSearchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { query, limit, region, response_type, cursor } = getDuckDuckGoSearchSchema.parse(req.query);
    const payload = await getDuckDuckGoSearchResults(query, limit, region, response_type, cursor, undefined, {
      userId: req.apiConsumer?.id,
      apiTokenId: req.apiConsumer?.tokenId,
      ipAddress: req.ip,
      userAgent: req.header("user-agent") ?? null,
    });

    res.status(200).json(createSuccessResponse("DuckDuckGo search completed successfully", payload));
  } catch (error) {
    next(error);
  }
}

export async function postDuckDuckGoSearchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { query, limit, region, response_type, cursor, proxy } = postDuckDuckGoSearchSchema.parse({
      ...req.body,
      limit: req.body?.limit ?? req.query.limit,
      region: req.body?.region ?? req.query.region,
      response_type: req.body?.response_type ?? req.query.response_type,
      cursor: req.body?.cursor ?? req.query.cursor,
    });

    if (proxy && !req.apiConsumer) {
      throw new AppError("Custom proxy is only available for authenticated x-api-token requests.", 403);
    }

    const payload = await getDuckDuckGoSearchResults(query, limit, region, response_type, cursor, proxy, {
      userId: req.apiConsumer?.id,
      apiTokenId: req.apiConsumer?.tokenId,
      ipAddress: req.ip,
      userAgent: req.header("user-agent") ?? null,
    });

    res.status(200).json(createSuccessResponse("DuckDuckGo search completed successfully", payload));
  } catch (error) {
    next(error);
  }
}
