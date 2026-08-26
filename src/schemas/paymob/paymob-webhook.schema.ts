//paymob-webhook.schema.ts

import { z } from "zod";

export const paymobTransactionWebhookSchema = z.object({
  type: z.literal("TRANSACTION"),

  obj: z.object({
    id: z.number().int().positive(),
    pending: z.boolean(),
    amount_cents: z.number().int().nonnegative(),
    success: z.boolean(),

    created_at: z.string(),

    currency: z.string(),

    error_occured: z.boolean(),

    has_parent_transaction: z.boolean(),

    integration_id: z.number().int(),

    is_3d_secure: z.boolean(),
    is_auth: z.boolean(),
    is_capture: z.boolean(),
    is_refunded: z.boolean(),
    is_standalone_payment: z.boolean(),
    is_voided: z.boolean(),

    owner: z.number().int(),

    order: z.object({
      id: z.number().int().positive(),
    }),

    source_data: z.object({
      pan: z.string(),
      sub_type: z.string(),
      type: z.string(),
    }),

    payment_key_claims: z.object({
      currency: z.string(),
      order_id: z.number().int().positive(),
      amount_cents: z.number().int().nonnegative(),
      next_payment_intention: z.string().nullable().optional(),
    }),

    is_live: z.boolean(),
  }),
});
