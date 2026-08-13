//checkout.routes.ts

import { Request, Response } from "express";

import { checkout as checkoutService } from "../services/checkout.service";

export const checkout = async (req: Request, res: Response) => {
  const result = await checkoutService(
    Number(req.user.id),
    req.validated!.body as any,
  );

  res.status(201).json(result);
};
