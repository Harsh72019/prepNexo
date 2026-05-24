import type { Request, Response } from "express";
import { ArenaService } from "../services/arena.service.js";

const arena = new ArenaService();

export class ArenaController {
  today = async (req: Request, res: Response) => {
    const mode = req.query.mode === "practice" ? "practice" : "ranked";
    const data = await arena.today(req.user!.id, mode);
    res.json({ data });
  };

  join = async (req: Request, res: Response) => {
    const mode = req.body.mode === "practice" ? "practice" : "ranked";
    const data = await arena.join(req.user!.id, mode);
    res.status(201).json({ data });
  };

  submit = async (req: Request, res: Response) => {
    const data = await arena.submit(req.user!.id, req.body);
    res.json({ data });
  };

  overall = async (req: Request, res: Response) => {
    const data = await arena.overall(req.user!.id);
    res.json({ data });
  };
}
