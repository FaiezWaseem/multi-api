import cors from "cors";
import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

import {
  getCrawlController,
  postCrawlController,
} from "./controllers/crawl.controller";
import {
  getDuckDuckGoSearchController,
  postDuckDuckGoSearchController,
} from "./controllers/duckduckgo.controller";
import {
  getCompanyContactController,
  postCompanyContactController,
} from "./controllers/company-contact.controller";
import { llmGuide } from "./docs/llm-guide";
import { swaggerSpec } from "./docs/swagger";
import { AppError } from "./lib/app-error";
import { createErrorResponse } from "./lib/api-response";
import "./lib/db";
import { ensureDefaultAdminUser } from "./services/auth.service";
import { requestLogMiddleware } from "./middlewares/request-log";
import { attachApiConsumer, requireApiTokenAccess } from "./middlewares/auth";
import { searchRateLimiter } from "./middlewares/rate-limit";
import { adminRouter } from "./routes/admin.routes";
import { authRouter } from "./routes/auth.routes";
import { logRouter } from "./routes/log.routes";
import { usageRouter } from "./routes/usage.routes";
import { accountViewHtml } from "./views/account-view";
import { landingViewHtml } from "./views/landing-view";
await ensureDefaultAdminUser();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(attachApiConsumer);
app.use(requestLogMiddleware);

app.get("/", (_req: Request, res: Response) => {
  res.type("html").send(landingViewHtml);
});

app.get("/account", (_req: Request, res: Response) => {
  res.type("html").send(accountViewHtml);
});

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});

app.get("/llm.txt", (_req: Request, res: Response) => {
  res.type("text/plain").send(llmGuide);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/log", logRouter);
app.use("/usage", usageRouter);

app.get("/crawl", requireApiTokenAccess, searchRateLimiter, getCrawlController);
app.post("/crawl", requireApiTokenAccess, searchRateLimiter, postCrawlController);
app.get("/search/duckduckgo", searchRateLimiter, getDuckDuckGoSearchController);
app.post("/search/duckduckgo", searchRateLimiter, postDuckDuckGoSearchController);
app.get("/search/company-contacts", searchRateLimiter, getCompanyContactController);
app.post("/search/company-contacts", searchRateLimiter, postCompanyContactController);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res
      .status(400)
      .json(createErrorResponse("Invalid request data", 400, error.issues));
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode, error.data));
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  res.status(500).json(createErrorResponse(message, 500));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
