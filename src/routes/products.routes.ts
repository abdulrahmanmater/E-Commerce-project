// products.routes.ts

import { Router } from "express";
const router = Router();
import {
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createProductSchema } from "../schemas/products/create.product.schema";
import { UserRole } from "../types/shared/status";
import { updateProductSchema } from "../schemas/products/update.product.schema";
import { updateProductVisibilitySchema } from "../schemas/products/visibility.schema";
import { updateProductVisibility } from "../controllers/product.controller";

router.get("/:productId", auth, getProductById);
router.post(
  "/",
  auth,
  authorize(UserRole.SELLER),
  validate(createProductSchema),
  addProduct,
);
router.patch(
  "/:productId",
  auth,
  authorize(UserRole.SELLER),
  validate(updateProductSchema),
  updateProduct,
);
router.delete("/:productId", auth, authorize(UserRole.SELLER), deleteProduct);
router.patch(
  "/:productId/visibility",
  auth,
  authorize(UserRole.SELLER),
  validate(updateProductVisibilitySchema),
  updateProductVisibility,
);

// GET /stores/:storeId/products → مين؟
export default router;
