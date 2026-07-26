// validate.middleware.ts

import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../errors/bad-request-error";

type RequestSchema = z.ZodObject<{
  body: z.ZodTypeAny;
  params: z.ZodTypeAny;
  query: z.ZodTypeAny;
}>;

export const validate =
  (schema: RequestSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.slice(1).join("."),
        message: issue.message,
      }));

      throw new BadRequestError("Validation failed", errors);
    }

    req.body = result.data.body;
    Object.defineProperty(req, "params", {
      value: result.data.params,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(req, "query", {
      value: result.data.query,
      writable: true,
      enumerable: true,
      configurable: true,
    });

    next();
  };
