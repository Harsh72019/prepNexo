import type { Request, Response } from "express";
import { PracticeService } from "../services/practice.service.js";

const practice = new PracticeService();

export class PracticeController {
  catalog = async (req: Request, res: Response) => {
    const catalog = await practice.catalog(req.user!.id);
    res.json({ data: catalog });
  };

  submitAttempt = async (req: Request, res: Response) => {
    const attempt = await practice.submitAttempt(req.user!.id, req.body);
    res.status(201).json({ data: attempt });
  };
}
