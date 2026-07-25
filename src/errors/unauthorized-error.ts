//unauthorized-error.ts

import { StatusCodes } from "../constants/status-codes";
import { AppError } from "./app-error";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
