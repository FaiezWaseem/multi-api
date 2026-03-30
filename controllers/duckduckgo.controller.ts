import type { NextFunction, Request, Response } from "express";

import { createSuccessResponse } from "../lib/api-response";
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
    const { query, limit, region } = getDuckDuckGoSearchSchema.parse(req.query);
    const payload = await getDuckDuckGoSearchResults(query, limit, region, {
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
    const { query, limit, region } = postDuckDuckGoSearchSchema.parse({
      ...req.body,
      limit: req.body?.limit ?? req.query.limit,
      region: req.body?.region ?? req.query.region,
    });
    const payload = await getDuckDuckGoSearchResults(query, limit, region, {
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
