import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";

const dashboard = new DashboardService();

export class DashboardController {
  summary = async (req: Request, res: Response) => {
    const summary = await dashboard.getSummary(req.user!.id);
    res.json({ data: summary });
  };
}
