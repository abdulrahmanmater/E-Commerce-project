//params.dto.ts

import { z } from "zod";

import { ordersQuerySchema } from "../../schemas/orders/get.order.schema";

export type OrdersParamsDto = z.infer<typeof ordersQuerySchema>["params"];
