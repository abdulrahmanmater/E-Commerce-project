// users.controller

import { CreateUserDto } from "../dtos/user/create.dto";
import {
  createUser as createUserService,
  getCurrentUser as getCurrentUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "../services/user.service";
import { Request, Response } from "express";

// addUser

export const createUser = async (req: Request, res: Response) => {
  const user = req.validated!.body as CreateUserDto;
  res.status(201).json(await createUserService(user));
};

//getCurrentUser

export const getCurrentUser = async (req: Request, res: Response) => {
  const id = Number(req.user.id);
  return res.status(200).json(await getCurrentUserService(id));
};

//updateUser

export const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.user.id);
  return res.status(200).json(await updateUserService(id, req.body));
};

//deleteUser

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.user.id);
  return res.status(200).json(await deleteUserService(id));
};
