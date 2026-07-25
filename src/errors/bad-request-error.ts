//bad-request-error.ts

import { StatusCodes } from "../constants/status-codes";
import { AppError } from "./app-error";
import { ValidationError } from "../interfaces/validation-error";

export class BadRequestError extends AppError {
  readonly errors: ValidationError[];
  constructor(message: string = "Bad Request", errors: ValidationError[] = []) {
    super(message, StatusCodes.BAD_REQUEST);
    this.errors = errors;
  }
}
