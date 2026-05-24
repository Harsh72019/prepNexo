import { Router } from "express";
import { BillingController } from "../controllers/billing.controller.js";
import { asyncHandler } from "../middlewares/async-handler.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/require-admin.js";
import { validate } from "../middlewares/validate.js";
import { billingPlanSchema, checkoutOrderSchema, verifyPaymentSchema } from "../validators/billing.validator.js";

const router = Router();
const controller = new BillingController();

router.get("/plans", asyncHandler(controller.plans));
router.get("/status", authenticate, asyncHandler(controller.status));
router.post("/checkout-order", authenticate, validate(checkoutOrderSchema), asyncHandler(controller.checkoutOrder));
router.post("/verify", authenticate, validate(verifyPaymentSchema), asyncHandler(controller.verify));
router.get("/admin/plans", authenticate, requireAdmin, asyncHandler(controller.adminPlans));
router.post("/admin/plans", authenticate, requireAdmin, validate(billingPlanSchema), asyncHandler(controller.upsertPlan));

export { router as billingRoutes };
