//update.cartItem.schema.ts

import { z } from "zod";
import { createCartItemSchema } from "./create.cartItem.schema";
import { productIdParamsSchema } from "../shared/params.schema";

export const updateCartItemSchema = z.object({
  body: createCartItemSchema.shape.body.pick({
    quantity: true,
  }),

  params: productIdParamsSchema,

  query: z.object({}),
});
