import { Router } from "express";
import { PracticeController } from "../controllers/practice.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { submitAttemptSchema } from "../validators/practice.validator.js";

const router = Router();
const controller = new PracticeController();

router.get("/catalog", authenticate, asyncHandler(controller.catalog));
router.post("/attempts", authenticate, validate(submitAttemptSchema), asyncHandler(controller.submitAttempt));

export { router as practiceRoutes };
