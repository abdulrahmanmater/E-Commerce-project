import { Router } from "express";

import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";

import {
  getOrderByOrderId,
  getOrders,
  updateOrderItemStatus,
} from "../controllers/order.controller";

import { ordersQuerySchema } from "../schemas/orders/get.order.schema";

import { updateOrderItemStatusSchema } from "../schemas/orders/update.order.schema";
import { UserRole } from "../types/shared/status";

const router = Router();

router.get("/", auth, validate(ordersQuerySchema), getOrders);

router.get("/:orderId", auth, validate(ordersQuerySchema), getOrderByOrderId);

router.patch(
  "/order-items/:orderItemId/status",
  auth,
  authorize(UserRole.SELLER),
  validate(updateOrderItemStatusSchema),
  updateOrderItemStatus,
);

export default router;
