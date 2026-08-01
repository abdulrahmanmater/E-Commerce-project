// create.product.schema

import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name must be at most 100 characters"),
    price: z.coerce
      .number("Price must be a number")
      .positive("Price must be greater than 0"),
    quantity: z.coerce
      .number("Quantity must be a number")
      .positive("Quantity must be greater than 0"),

    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters")
      .optional()
      .default(""),
  }),
  params: z.object({}),
  query: z.object({}),
});
