//auth.controller.ts

import { Request, Response } from "express";
import { LoginRequestDto } from "../dtos/auth/login.dto";
import { login as loginService } from "../services/auth";

// login auth

export const login = async (req: Request, res: Response) => {
  const user: LoginRequestDto = req.body;
  return res.json(await loginService(user));
};
