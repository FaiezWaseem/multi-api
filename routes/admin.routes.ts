import { Router } from "express";

import {
  getAdminMetricsController,
  getAdminRequestLogsController,
} from "../controllers/admin.controller";
import { requireAuthSession } from "../middlewares/auth";

const adminRouter = Router();

adminRouter.get("/metrics", requireAuthSession, getAdminMetricsController);
adminRouter.get("/requests", requireAuthSession, getAdminRequestLogsController);

export { adminRouter };
