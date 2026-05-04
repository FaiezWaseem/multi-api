import type { NextFunction, Request, Response } from "express";

import { createSuccessResponse } from "../lib/api-response";
import { AppError } from "../lib/app-error";
import { getYelpSearchResults } from "../services/yelp.service";
import {
  getYelpSearchSchema,
  postYelpSearchSchema,
} from "../validations/search.validation";

export async function getYelpSearchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      query,
      location,
      limit,
      response_type,
      cursor,
      include_reviews,
      include_contact,
      find_email,
      find_website,
    } = getYelpSearchSchema.parse(req.query);

    const payload = await getYelpSearchResults(
      query,
      location,
      limit,
      response_type,
      cursor,
      undefined,
      {
        includeReviews: include_reviews,
        includeContact: include_contact,
        enrichment: {
          findEmail: find_email,
          findWebsite: find_website,
        },
      },
      {
        userId: req.apiConsumer?.id,
        apiTokenId: req.apiConsumer?.tokenId,
        ipAddress: req.ip,
        userAgent: req.header("user-agent") ?? null,
      },
    );

    res.status(200).json(createSuccessResponse("Yelp search completed successfully", payload));
  } catch (error) {
    next(error);
  }
}

export async function postYelpSearchController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      query,
      location,
      limit,
      response_type,
      cursor,
      include_reviews,
      include_contact,
      find_email,
      find_website,
      proxy,
    } = postYelpSearchSchema.parse({
      ...req.body,
      limit: req.body?.limit ?? req.query.limit,
      response_type: req.body?.response_type ?? req.query.response_type,
      cursor: req.body?.cursor ?? req.query.cursor,
      include_reviews: req.body?.include_reviews ?? req.query.include_reviews,
      include_contact: req.body?.include_contact ?? req.query.include_contact,
      find_email: req.body?.find_email ?? req.query.find_email,
      find_website: req.body?.find_website ?? req.query.find_website,
    });

    if (proxy && !req.apiConsumer) {
      throw new AppError("Custom proxy is only available for authenticated x-api-token requests.", 403);
    }

    const payload = await getYelpSearchResults(
      query,
      location,
      limit,
      response_type,
      cursor,
      proxy,
      {
        includeReviews: include_reviews,
        includeContact: include_contact,
        enrichment: {
          findEmail: find_email,
          findWebsite: find_website,
        },
      },
      {
        userId: req.apiConsumer?.id,
        apiTokenId: req.apiConsumer?.tokenId,
        ipAddress: req.ip,
        userAgent: req.header("user-agent") ?? null,
      },
    );

    res.status(200).json(createSuccessResponse("Yelp search completed successfully", payload));
  } catch (error) {
    next(error);
  }
}
