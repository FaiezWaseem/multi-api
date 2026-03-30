import { Router } from "express";

import {
  createApiTokenController,
  listApiTokensController,
  loginController,
  revokeApiTokenController,
  registerController,
  updateApiTokenController,
} from "../controllers/auth.controller";
import { requireAuthSession } from "../middlewares/auth";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/tokens", requireAuthSession, listApiTokensController);
authRouter.post("/tokens", requireAuthSession, createApiTokenController);
authRouter.patch("/tokens/:id", requireAuthSession, updateApiTokenController);
authRouter.delete("/tokens/:id", requireAuthSession, revokeApiTokenController);

export { authRouter };
