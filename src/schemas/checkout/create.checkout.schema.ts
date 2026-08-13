//create.checkout.schema.ts

import { z } from "zod";

export const createCheckoutSchema = z.object({
  body: z.object({
    addressId: z.coerce
      .number("Address id must be a number")
      .int("Address id must be an integer")
      .positive("Address id must be greater than positive number"),
  }),
  params: z.object({}),
  query: z.object({}),
});
