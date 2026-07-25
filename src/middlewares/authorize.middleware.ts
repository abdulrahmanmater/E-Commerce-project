//authorize.middleware.ts

import { Request, Response, NextFunction } from "express";
import { UserRole } from "../dtos/create-user.dto";
import { ForbiddenError } from "../errors/forbidden-error";

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError();
    }
    next();
  };
};
