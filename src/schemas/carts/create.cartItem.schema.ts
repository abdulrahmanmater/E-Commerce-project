// create.cartItem.schema.ts

import { z } from "zod";

export const createCartItemSchema = z.object({
  body: z.object({
    productId: z.coerce
      .number("Product id must be a number")
      .int("Product id must be an integer")
      .positive("Product id must be greater than 0"),
    quantity: z.coerce
      .number("Quantity must be a number")
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than 0"),
  }),
  params: z.object({}),
  query: z.object({}),
});
