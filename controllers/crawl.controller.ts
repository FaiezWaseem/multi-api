import type { NextFunction, Request, Response } from "express";

import { createSuccessResponse } from "../lib/api-response";
import { AppError } from "../lib/app-error";
import { getCrawlResults } from "../services/crawl.service";
import { getCrawlSchema, postCrawlSchema } from "../validations/crawl.validation";

export async function getCrawlController(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, response_type, js_code } = getCrawlSchema.parse(req.query);
    const payload = await getCrawlResults(url, response_type, js_code, undefined, {
      userId: req.apiConsumer?.id,
      creditCost: 1,
    });

    res.status(200).json(createSuccessResponse("Page crawl completed successfully", payload));
  } catch (error) {
    next(error);
  }
}

export async function postCrawlController(req: Request, res: Response, next: NextFunction) {
  try {
    const { url, response_type, js_code, proxy } = postCrawlSchema.parse({
      ...req.body,
      response_type: req.body?.response_type ?? req.query.response_type,
      js_code: req.body?.js_code ?? req.query.js_code,
    });

    if (proxy && !req.apiConsumer) {
      throw new AppError("Custom proxy is only available for authenticated x-api-token requests.", 403);
    }

    const payload = await getCrawlResults(url, response_type, js_code, proxy, {
      userId: req.apiConsumer?.id,
      creditCost: 1,
    });

    res.status(200).json(createSuccessResponse("Page crawl completed successfully", payload));
  } catch (error) {
    next(error);
  }
}
