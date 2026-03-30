import { Router } from "express";

import {
  createApiTokenController,
  listApiTokensController,
  loginController,
  registerController,
} from "../controllers/auth.controller";
import { requireAuthSession } from "../middlewares/auth";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.get("/tokens", requireAuthSession, listApiTokensController);
authRouter.post("/tokens", requireAuthSession, createApiTokenController);

export { authRouter };
