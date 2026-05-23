import type { Request, Response } from "express";
import type { OnboardingInput } from "@interview-battlefield/types";
import { OnboardingService } from "../services/onboarding.service.js";

const onboarding = new OnboardingService();

export class OnboardingController {
  status = async (req: Request, res: Response) => {
    const data = await onboarding.status(req.user!.id);
    res.json({ data });
  };

  complete = async (req: Request, res: Response) => {
    const data = await onboarding.complete(req.user!.id, req.body as OnboardingInput);
    res.json({ data });
  };
}
