import { Router } from "express";
import { AdaptiveController } from "../controllers/adaptive.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { pressurePromptSchema } from "../validators/adaptive.validator.js";

const router = Router();
const controller = new AdaptiveController();

router.get("/growth-profile", authenticate, asyncHandler(controller.profile));
router.get("/skill-graph", authenticate, asyncHandler(controller.skillGraph));
router.get("/daily-session", authenticate, asyncHandler(controller.dailySession));
router.post("/pressure", authenticate, validate(pressurePromptSchema), asyncHandler(controller.pressure));

export { router as adaptiveRoutes };
