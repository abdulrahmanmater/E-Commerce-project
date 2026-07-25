//auth.MDW

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../errors/unauthorized-error";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError();
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
};
