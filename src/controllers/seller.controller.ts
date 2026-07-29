// seller.controller

import { Request, Response } from "express";
import {
  createSeller as createSellerService,
  getMySellerApplication,
} from "../services/seller.service";
import { CreateSellerDto } from "../dtos/create-seller.dto";

// createSeller
export const createSeller = async (req: Request, res: Response) => {
  return res
    .status(201)
    .json(
      await createSellerService(
        Number(req.user.id),
        req.validated!.body as CreateSellerDto,
      ),
    );
};

export const getSellerApplicationByUserId = async (
  req: Request,
  res: Response,
) => {
  return res
    .status(200)
    .json(await getMySellerApplication(Number(req.user.id)));
};
