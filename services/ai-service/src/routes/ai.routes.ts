import { Router } from "express";
import { AiController } from "../controllers/ai.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";

const router = Router();
const controller = new AiController();

router.post("/interviewer", asyncHandler(controller.interviewer));
router.post("/interviewer/stream", asyncHandler(controller.streamInterviewer));
router.post("/code-feedback", asyncHandler(controller.codeFeedback));
router.post("/code-feedback/stream", asyncHandler(controller.streamCodeFeedback));
router.post("/system-design-feedback", asyncHandler(controller.systemDesignFeedback));
router.post("/system-design-feedback/stream", asyncHandler(controller.streamSystemDesignFeedback));
router.post("/roadmap", asyncHandler(controller.roadmap));
router.post("/roadmap/stream", asyncHandler(controller.streamRoadmap));

export { router as aiRoutes };
