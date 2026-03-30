import { Router } from "express";

import {
  addCreditsToUserController,
  getAdminMetricsController,
  getAdminRequestLogsController,
  getAdminUsersController,
  getAdminViewController,
} from "../controllers/admin.controller";
import { requireAuthSession } from "../middlewares/auth";

const adminRouter = Router();

adminRouter.get("/view", getAdminViewController);
adminRouter.get("/metrics", requireAuthSession, getAdminMetricsController);
adminRouter.get("/requests", requireAuthSession, getAdminRequestLogsController);
adminRouter.get("/users", requireAuthSession, getAdminUsersController);
adminRouter.post("/users/:id/credits", requireAuthSession, addCreditsToUserController);

export { adminRouter };
