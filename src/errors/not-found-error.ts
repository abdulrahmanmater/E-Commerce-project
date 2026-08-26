//not-found-error.ts

import { StatusCodes } from "../constants/status";
import { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(message: string = "Not Found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}
