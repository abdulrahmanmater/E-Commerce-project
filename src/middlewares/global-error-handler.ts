//global-error-handler.ts

import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!(err instanceof AppError)) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  }
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
