import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { HttpError } from "../lib/http-error.js";

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!result.success) {
      const issues = result.error.flatten().fieldErrors as Record<string, string[]>;
      return next(new HttpError(422, "Request validation failed", "VALIDATION_ERROR", issues));
    }

    Object.assign(req, result.data);
    next();
  };
}
