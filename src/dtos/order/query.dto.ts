//query.dto.ts

import { z } from "zod";
import { ordersQuerySchema } from "../../schemas/orders/get.order.schema";

export type OrdersQueryDto = z.infer<typeof ordersQuerySchema>["query"];
