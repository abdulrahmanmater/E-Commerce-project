//global-error-handler.ts

import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { BadRequestError } from "../errors/bad-request-error";
import { DatabaseError } from "pg";
import { StatusCodes } from "../constants/status-codes";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof DatabaseError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      message:
        err.code === "23505"
          ? "Email already exists" // to-do global it
          : "The fields should not be empty",
    });
  }
  if (err instanceof BadRequestError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  console.error(err);
  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
