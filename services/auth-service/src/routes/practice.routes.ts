import { Router } from "express";
import { PracticeController } from "../controllers/practice.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/require-admin.js";
import { validate } from "../middlewares/validate.js";
import { questionInputSchema, questionUpdateSchema, submitAttemptSchema } from "../validators/practice.validator.js";

const router = Router();
const controller = new PracticeController();

router.get("/catalog", authenticate, asyncHandler(controller.catalog));
router.post("/attempts", authenticate, validate(submitAttemptSchema), asyncHandler(controller.submitAttempt));
router.get("/admin/questions", authenticate, requireAdmin, asyncHandler(controller.listQuestions));
router.post("/admin/questions", authenticate, requireAdmin, validate(questionInputSchema), asyncHandler(controller.upsertQuestion));
router.patch("/admin/questions/:id", authenticate, requireAdmin, validate(questionUpdateSchema), asyncHandler(controller.updateQuestion));

export { router as practiceRoutes };
