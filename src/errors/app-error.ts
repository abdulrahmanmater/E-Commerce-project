//app-error.ts

import { StatusCodes } from "../constants/status-codes";

export class AppError extends Error {
  statusCode: StatusCodes;
  status: "fail" | "error";
  readonly isOperational: boolean;

  constructor(message: string, statusCode: StatusCodes, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
