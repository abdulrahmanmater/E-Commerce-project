//auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../errors/unauthorized-error";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or malformed authorization header"),
    );
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Missing access token");
  }
  try {
    req.user = verifyAccessToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
  next();
};
