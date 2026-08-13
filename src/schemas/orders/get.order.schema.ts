//get.order.schema.ts

import { z } from "zod";
import {
  sortOrderValues,
  ordersSortingValues,
  orderItemsSortingValues,
} from "../../constants/allowed-sorting";
import { orderIdParamsSchema } from "../shared/params.schema";

export const ordersQuerySchema = z.object({
  body: z.object({}),
  params: orderIdParamsSchema,
  query: z.object({
    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1)
      .max(100)
      .default(10),
    page: z.coerce.number().int("Page must be an integer").min(1).default(1),
    ordersSorting: z.enum(ordersSortingValues).default("createdAt"),
    orderItemsSorting: z.enum(orderItemsSortingValues).default("updatedAt"),
    sortOrder: z.enum(sortOrderValues).default("asc"),
    minTotalPrice: z.coerce
      .number("Min price must be a number")
      .positive("Min price must be greater than 0")
      .optional(),
    maxTotalPrice: z.coerce
      .number("Max price must be a number")
      .positive("Max price must be greater than 0")
      .optional(),
    minItemPrice: z.coerce
      .number("Min price must be a number")
      .positive("Min price must be greater than 0")
      .optional(),
    maxItemPrice: z.coerce
      .number("Max price must be a number")
      .positive("Max price must be greater than 0")
      .optional(),
  }),
});
