//create.checkout.schema.ts

import { z } from "zod";
import { paymentMethods } from "../../constants/payment-status";

export const createCheckoutSchema = z.object({
  body: z.object({
    addressId: z.coerce
      .number("Address id must be a number")
      .int("Address id must be an integer")
      .positive("Address id must be greater than positive number"),

    method: z.enum(paymentMethods, "invalid method"),
  }),
  params: z.object({}),
  query: z.object({}),
});
