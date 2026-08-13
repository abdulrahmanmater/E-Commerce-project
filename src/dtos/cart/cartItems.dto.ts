//cartItems.dto.ts

import { z } from "zod";
import { createCartItemSchema } from "../../schemas/carts/create.cartItem.schema";
import { updateCartItemSchema } from "../../schemas/carts/update.cartItem.schema";

export type AddCartItemDto = z.infer<typeof createCartItemSchema>["body"];

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>["body"];

export interface CartItemResponseDto {
  itemId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subTotal: number;
}

export interface CartItemsResponseDto {
  cartId: number | null;

  items: CartItemResponseDto[];

  total: number;
}

export interface CartItemMutationResponseDto {
  id: number;
  productId: number;
  quantity: number;
}

export interface AddCartItemResponseDto {
  message: string;
  cartItem: CartItemMutationResponseDto;
}
