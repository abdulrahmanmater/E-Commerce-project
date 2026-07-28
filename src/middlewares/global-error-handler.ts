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
    console.log({
      code: err.code,
      message: err.message,
      detail: err.detail,
      where: err.where,
      table: err.table,
      column: err.column,
      constraint: err.constraint,
    });
    switch (err.code) {
      case "23505":
        switch (err.constraint) {
          case "users_email_key":
            return res.status(StatusCodes.CONFLICT).json({
              status: "error",
              message: "Email already exists",
            });

          case "national_id":
            return res.status(StatusCodes.CONFLICT).json({
              status: "error",
              message: "National ID already exists",
            });

          case "bank_account_number":
            return res.status(StatusCodes.CONFLICT).json({
              status: "error",
              message: "Bank account number already exists",
            });

          default:
            return res.status(StatusCodes.CONFLICT).json({
              status: "error",
              message: "A unique value already exists",
            });
        }

      case "23502":
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          message: "A required field is missing",
        });

      case "23503":
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          message: "Invalid reference",
        });

      case "22P02":
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          message: "Invalid input syntax",
        });

      default:
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: "error",
          message: "Database error",
        });
    }
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
