//checkout.controller.ts

import { Request, Response } from "express";

import { checkout as checkoutService } from "../services/checkout.service";
import { CheckoutDto } from "../dtos/checkout/checkout.dto";

export const checkout = async (req: Request, res: Response) => {
  const result = await checkoutService(
    Number(req.user.id),
    req.validated!.body as CheckoutDto,
  );

  res.status(201).json(result);
};
