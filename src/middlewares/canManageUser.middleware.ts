//canManageUser.middleware.ts

import { Request, Response, NextFunction } from "express";
import { UserRole } from "../dtos/user/user.response.dto";
import { ForbiddenError } from "../errors/forbidden-error";

export const canManageUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;
  const userId = req.user.id;

  if (req.user.role !== UserRole.ADMIN && id !== userId.toString()) {
    throw new ForbiddenError();
  }
  next();
};
