// sellers.routes

import { validate } from "../middlewares/validate.middleware";
import { createSellerSchema } from "../schemas/create-seller.schema";
import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { UserRole } from "../dtos/user/user.response.dto";
import { Router } from "express";
import { createSeller } from "../controllers/seller.controller";
const router = Router();

router.post(
  "/",
  auth,
  authorize(UserRole.CUSTOMER),
  validate(createSellerSchema),
  createSeller,
);

export default router;
