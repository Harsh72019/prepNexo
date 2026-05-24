import type { Request, Response } from "express";
import { BillingService } from "../services/billing.service.js";

const billing = new BillingService();

export class BillingController {
  plans = async (_req: Request, res: Response) => {
    const plans = await billing.plans();
    res.json({ data: plans });
  };

  status = async (req: Request, res: Response) => {
    const status = await billing.status(req.user!.id);
    res.json({ data: status });
  };

  checkoutOrder = async (req: Request, res: Response) => {
    const order = await billing.createCheckoutOrder(req.user!.id, req.body.planCode);
    res.status(201).json({ data: order });
  };

  verify = async (req: Request, res: Response) => {
    const status = await billing.verifyPayment(req.user!.id, req.body);
    res.json({ data: status });
  };

  adminPlans = async (_req: Request, res: Response) => {
    const plans = await billing.adminPlans();
    res.json({ data: plans });
  };

  upsertPlan = async (req: Request, res: Response) => {
    const plan = await billing.upsertPlan(req.body);
    res.status(201).json({ data: plan });
  };
}
