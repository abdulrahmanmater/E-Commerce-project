// internal-server-error.ts

import { AppError } from "./app-error";
import { StatusCodes } from "../constants/status";

export class InternalServerError extends AppError {
  constructor(message = "Something went wrong") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
