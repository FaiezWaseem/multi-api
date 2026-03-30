import { Router } from "express";

import {
  getLoginLogsController,
  getSearchLogsController,
} from "../controllers/log.controller";
import { requireAuthSession, requireAuthSessionOrApiToken } from "../middlewares/auth";

const logRouter = Router();

logRouter.get("/searches", requireAuthSessionOrApiToken, getSearchLogsController);
logRouter.get("/logins", requireAuthSession, getLoginLogsController);

export { logRouter };
