// users.controller

import {
  createUser as createUserService,
  getCurrentUser as getCurrentUserService,
} from "../services/user.service";
import { Request, Response } from "express";

// addUser

export const createUser = async (req: Request, res: Response) => {
  const user = req.body;
  res.status(201).json(await createUserService(user));
};

//getCurrentUser

export const getCurrentUser = async (req: Request, res: Response) => {
  const id = Number(req.user.id);
  return res.status(200).json(await getCurrentUserService(id));
};
