import type { Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";
import { PracticeService } from "../services/practice.service.js";

const practice = new PracticeService();

export class PracticeController {
  catalog = async (req: Request, res: Response) => {
    const catalog = await practice.catalog(req.user!.id);
    res.json({ data: catalog });
  };

  questionLibrary = async (req: Request, res: Response) => {
    const library = await practice.questionLibrary(req.user!.id, {
      page: Number(req.query.page),
      pageSize: Number(req.query.pageSize),
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      type: typeof req.query.type === "string" ? req.query.type : undefined,
      difficulty:
        typeof req.query.difficulty === "string"
          ? req.query.difficulty
          : undefined,
      topic: typeof req.query.topic === "string" ? req.query.topic : undefined,
      company:
        typeof req.query.company === "string" ? req.query.company : undefined,
      companyTag:
        typeof req.query.companyTag === "string"
          ? req.query.companyTag
          : undefined,
      progress:
        typeof req.query.progress === "string" ? req.query.progress : undefined,
    });
    res.json({ data: library });
  };

  question = async (req: Request, res: Response) => {
    if (!req.params.id)
      throw new HttpError(400, "Missing question id", "MISSING_QUESTION_ID");
    const question = await practice.question(req.user!.id, req.params.id);
    res.json({ data: question });
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
    if (!req.params.id)
      throw new HttpError(400, "Missing question id", "MISSING_QUESTION_ID");
    const question = await practice.updateQuestion(req.params.id, req.body);
    res.json({ data: question });
  };
}
