//app-error.ts

import { StatusCodes } from "../constants/status-codes";

export class AppError extends Error {
  readonly statusCode: StatusCodes;
  readonly status: "fail" | "error";
  readonly isOperational = true;

  constructor(message: string, statusCode: StatusCodes) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
