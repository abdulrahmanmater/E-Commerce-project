// seller.controller

import { Request, Response } from "express";
import {
  createSeller as createSellerService,
  getMySellerApplication,
} from "../services/seller.service";

// createSeller
export const createSeller = async (req: Request, res: Response) => {
  const id = Number(req.user.id);
  return res.status(201).json(await createSellerService(id, req.body));
};

export const getSellerApplicationByUserId = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.user.id);
  return res.status(200).json(await getMySellerApplication(id));
};
