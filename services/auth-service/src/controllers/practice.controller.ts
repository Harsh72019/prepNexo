import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";
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

  listQuestions = async (_req: Request, res: Response) => {
    const questions = await practice.listQuestions();
    res.json({ data: questions });
  };

  upsertQuestion = async (req: Request, res: Response) => {
    const question = await practice.upsertQuestion(req.user!.id, req.body);
    res.status(201).json({ data: question });
  };

  updateQuestion = async (req: Request, res: Response) => {
    if (!req.params.id) throw new HttpError(400, "Missing question id", "MISSING_QUESTION_ID");
    const question = await practice.updateQuestion(req.params.id, req.body);
    res.json({ data: question });
  };
}
