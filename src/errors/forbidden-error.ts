//forbidden-error.ts

import { StatusCodes } from "../constants/status-codes";
import { AppError } from "./app-error";

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN);
  }
}
