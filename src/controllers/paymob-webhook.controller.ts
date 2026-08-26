// paymob-webhook.controller.ts

import { Request, Response } from "express";
import { handlePaymobTransaction } from "../services/paymob-webhook.service";

export const paymobWebhook = async (req: Request, res: Response) => {
  const hmac = req.query.hmac;

  if (typeof hmac !== "string") {
    return res.status(400).json({ message: "Missing HMAC" });
  }

  await handlePaymobTransaction(req.body, hmac);

  return res.sendStatus(200);
};
