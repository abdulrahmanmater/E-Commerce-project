import { z } from "zod";
import { createProductSchema } from "./create.product.schema";
import { productIdParamsSchema } from "../shared/params.schema";

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body
    .pick({
      name: true,
      price: true,
      quantity: true,
      description: true,
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),

  params: productIdParamsSchema,

  query: z.object({}),
});
