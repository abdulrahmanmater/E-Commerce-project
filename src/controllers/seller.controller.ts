// seller.controller

import { Request, Response } from "express";
import { createSeller as createSellerService } from "../services/seller.service";

// createSeller
export const createSeller = async (req: Request, res: Response) => {
  const id = Number(req.user.id);
  return res.status(201).json(await createSellerService(id, req.body));
};
