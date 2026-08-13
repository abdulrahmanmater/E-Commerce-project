// update.dto.ts

import { z } from "zod";
import { updateOrderItemStatusSchema } from "../../schemas/orders/update.order.schema";

export type UpdateOrderItemStatusBodyDto = z.infer<
  typeof updateOrderItemStatusSchema
>["body"];
export type UpdateOrderItemStatusParamsDto = z.infer<
  typeof updateOrderItemStatusSchema
>["params"];

export interface UpdateOrderItemStatusResponseDto {
  message: string;
  orderItem: {
    id: number;
    productId: number;
    status: string;
  };
}
