import type { Request, Response } from "express";
import { AdaptiveService } from "../services/adaptive.service.js";

const adaptiveService = new AdaptiveService();

export class AdaptiveController {
  profile = async (req: Request, res: Response) => {
    const data = await adaptiveService.getGrowthProfile(req.user!.id);
    res.json({ data });
  };

  skillGraph = async (req: Request, res: Response) => {
    const data = await adaptiveService.getGrowthProfile(req.user!.id);
    res.json({ data: data.skillGraph });
  };

  dailySession = async (req: Request, res: Response) => {
    await adaptiveService.ensureSkillGraph(req.user!.id);
    const data = await adaptiveService.getOrCreateDailySession(req.user!.id);
    res.json({ data });
  };

  pressure = async (req: Request, res: Response) => {
    const data = await adaptiveService.createPressurePrompt(req.user!.id, req.body);
    res.status(201).json({ data });
  };
}
