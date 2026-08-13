// cart.routes.ts

import { Router } from "express";
const router = Router();
import { auth } from "../middlewares/auth.middleware";
import {
  addCartItem,
  deleteCart,
  deleteCartItem,
  getCartItems,
  updateCartItem,
} from "../controllers/cart.controller";
import { validate } from "../middlewares/validate.middleware";
import { createCartItemSchema } from "../schemas/carts/create.cartItem.schema";
import { updateCartItemSchema } from "../schemas/carts/update.cartItem.schema";

router.get("/", auth, getCartItems);
router.post("/items", auth, validate(createCartItemSchema), addCartItem);
router.patch(
  "/items/:productId",
  auth,
  validate(updateCartItemSchema),
  updateCartItem,
);
router.delete("/items/:productId", auth, deleteCartItem);
router.delete("/", auth, deleteCart);

export default router;
