import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`, "NOT_FOUND"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      issues: error.issues
    });
  }

  console.error(error);
  return res.status(500).json({
    message: "Unexpected server error",
    code: "INTERNAL_SERVER_ERROR"
  });
}
