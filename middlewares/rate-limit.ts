import rateLimit from "express-rate-limit";

import { createErrorResponse } from "../lib/api-response";

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 20);

export const searchRateLimiter = rateLimit({
  windowMs,
  limit: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res
      .status(429)
      .json(createErrorResponse("Too many requests. Please try again later.", 429));
  },
});
