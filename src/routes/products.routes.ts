// products.routes.ts

import { Router } from "express";
const router = Router();
import {
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProducts,
} from "../controllers/product.controller";
import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createProductSchema } from "../schemas/products/create.product.schema";
import { UserRole } from "../types/shared/status";
import { updateProductSchema } from "../schemas/products/update.product.schema";
import { updateProductVisibilitySchema } from "../schemas/products/visibility.schema";
import { updateProductVisibility } from "../controllers/product.controller";
import { productsQuerySchema } from "../schemas/shared/query.schema";

router.get(
  "/me",
  auth,
  authorize(UserRole.SELLER),
  validate(productsQuerySchema),
  getMyProducts,
);
router.get("/:productId", getProductById);
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
router.get("/", validate(productsQuerySchema), getProducts);

export default router;
