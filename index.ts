import cors from "cors";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

import {
  getDuckDuckGoSearchController,
  postDuckDuckGoSearchController,
} from "./controllers/duckduckgo.controller";
import { swaggerSpec } from "./docs/swagger";
import { AppError } from "./lib/app-error";
import { createErrorResponse } from "./lib/api-response";
import "./lib/db";
import { attachApiConsumer } from "./middlewares/auth";
import { searchRateLimiter } from "./middlewares/rate-limit";
import { authRouter } from "./routes/auth.routes";
import { usageRouter } from "./routes/usage.routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(attachApiConsumer);

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/usage", usageRouter);

app.get("/search/duckduckgo", searchRateLimiter, getDuckDuckGoSearchController);
app.post("/search/duckduckgo", searchRateLimiter, postDuckDuckGoSearchController);

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
