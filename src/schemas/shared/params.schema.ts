//id.schema.ts

import { z } from "zod";

const id = z.coerce
  .number("Id must be a number")
  .int("Id must be an integer")
  .positive("Id must be greater than 0")
  .optional();

export const productIdParamsSchema = z.object({
  productId: id,
});

export const storeIdParamsSchema = z.object({
  storeId: id,
});

export const userIdParamsSchema = z.object({
  userId: id,
});

export const sellerIdParamsSchema = z.object({
  sellerId: id,
});

export const orderIdParamsSchema = z.object({
  orderId: id,
});
