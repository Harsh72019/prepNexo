import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return next(new HttpError(403, "Admin access required", "FORBIDDEN"));
  }
  next();
}
