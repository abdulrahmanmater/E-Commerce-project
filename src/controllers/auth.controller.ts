//auth.controller.ts

import { Request, Response } from "express";
import { LoginRequestDto } from "../dtos/auth/login.dto";
import { login as loginService } from "../services/auth";

// login auth

export const login = async (req: Request, res: Response) => {
  const user = req.validated!.body as LoginRequestDto;
  return res.json(await loginService(user));
};
