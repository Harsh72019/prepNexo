import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();
const controller = new DashboardController();

router.get("/summary", authenticate, asyncHandler(controller.summary));

export { router as dashboardRoutes };
