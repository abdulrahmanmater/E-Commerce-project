// update.order.schema.ts

import { z } from "zod";

export const updateOrderItemStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]),
  }),

  params: z.object({
    orderItemId: z.coerce
      .number()
      .int("Order item ID must be an integer")
      .positive("Order item ID must be greater than 0"),
  }),

  query: z.object({}),
});
