// validate.middleware.ts

import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/bad-request-error";

export const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw new BadRequestError("Validation failed", errors);
    }
    next();
  };
