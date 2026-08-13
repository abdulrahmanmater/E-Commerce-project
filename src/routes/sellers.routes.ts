// sellers.routes

import { validate } from "../middlewares/validate.middleware";
import { createSellerSchema } from "../schemas/create-seller.schema";
import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { UserRole } from "../types/shared/status.js";
import { Router } from "express";
import {
  createSeller,
  getSellerApplicationByUserId,
} from "../controllers/seller.controller";
const router = Router();

router.post(
  "/",
  auth,
  authorize(UserRole.CUSTOMER, UserRole.SELLER),
  validate(createSellerSchema),
  createSeller,
);
router.get("/me", auth, getSellerApplicationByUserId);

export default router;
