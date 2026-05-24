import { Router } from "express";
import { ArenaController } from "../controllers/arena.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { arenaSubmitSchema } from "../validators/arena.validator.js";

const router = Router();
const controller = new ArenaController();

router.get("/today", authenticate, asyncHandler(controller.today));
router.post("/join", authenticate, asyncHandler(controller.join));
router.post(
  "/submit",
  authenticate,
  validate(arenaSubmitSchema),
  asyncHandler(controller.submit),
);
router.get("/overall", authenticate, asyncHandler(controller.overall));

export { router as arenaRoutes };
