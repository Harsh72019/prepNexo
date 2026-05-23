import { Router } from "express";
import { OnboardingController } from "../controllers/onboarding.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { onboardingSchema } from "../validators/onboarding.validator.js";

const router = Router();
const controller = new OnboardingController();

router.get("/status", authenticate, asyncHandler(controller.status));
router.post("/complete", authenticate, validate(onboardingSchema), asyncHandler(controller.complete));

export { router as onboardingRoutes };
