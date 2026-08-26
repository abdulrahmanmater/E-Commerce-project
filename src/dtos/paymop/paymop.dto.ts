//paymop.dto.ts

import z from "zod";
import { paymobTransactionWebhookSchema } from "../../schemas/paymob/paymob-webhook.schema";

export type PaymobTransactionWebhook = z.infer<
  typeof paymobTransactionWebhookSchema
>;

export type PaymobTransaction = PaymobTransactionWebhook["obj"];
