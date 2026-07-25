//conflict-error.ts

import { StatusCodes } from "../constants/status-codes";
import { AppError } from "./app-error";

export class ConflictError extends AppError {
  constructor(message: string = "Conflict") {
    super(message, StatusCodes.CONFLICT);
  }
}
