//payment.routes.ts

import { Router } from "express";

import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";

import { UserRole } from "../constants/status";

import {
  startCardPayment,
  confirmCodPayment,
  getPaymentStatus,
} from "../controllers/payment.controller";

const router = Router();

router.post("/:paymentId/card-intention", auth, startCardPayment);

router.patch(
  "/:paymentId/confirm-cod",
  auth,
  authorize(UserRole.ADMIN),
  confirmCodPayment,
);

router.get("/:paymentId", auth, getPaymentStatus);

export default router;
