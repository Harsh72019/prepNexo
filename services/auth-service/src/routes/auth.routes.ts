import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from "../validators/auth.validator.js";

const router = Router();
const controller = new AuthController();

router.post("/register", validate(registerSchema), asyncHandler(controller.register));
router.post("/login", validate(loginSchema), asyncHandler(controller.login));
router.post("/refresh", validate(refreshSchema), asyncHandler(controller.refresh));
router.post("/logout", validate(refreshSchema), asyncHandler(controller.logout));
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(controller.forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(controller.resetPassword));
router.post("/verify-email", validate(verifyEmailSchema), asyncHandler(controller.verifyEmail));
router.get("/google", controller.googleRedirect);
router.get("/google/callback", asyncHandler(controller.googleCallback));
router.get("/me", authenticate, asyncHandler(controller.me));

export { router as authRoutes };
