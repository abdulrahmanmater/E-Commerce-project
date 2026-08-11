//cartItems.dto.ts

import z from "zod";
import { createCartItemSchema } from "../../schemas/carts/create.cartItem.schema";
import { updateCartItemSchema } from "../../schemas/carts/update.cartItem.schema";

export interface CartItemsResponseDto {
  cartId: number | null;
  items: {
    itemId: number;
    products: {
      productId: number;
      name: string;
      price: number;
    };
    quantity: number;
    subTotal: number;
  }[];
  total: number;
}

export type AddCartItemDto = z.infer<typeof createCartItemSchema>["body"];
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>["body"];
