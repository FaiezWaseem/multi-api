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
import { createErrorResponse } from "./lib/api-response";
import { searchRateLimiter } from "./middlewares/rate-limit";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/search/duckduckgo", searchRateLimiter, getDuckDuckGoSearchController);
app.post("/search/duckduckgo", searchRateLimiter, postDuckDuckGoSearchController);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    res
      .status(400)
      .json(createErrorResponse("Invalid request data", 400, error.issues));
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  res.status(500).json(createErrorResponse(message, 500));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
