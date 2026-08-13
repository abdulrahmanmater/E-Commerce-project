// cart.service.ts

import pool from "../config/db";

import {
  AddCartItemDto,
  AddCartItemResponseDto,
  CartItemsResponseDto,
  CartItemMutationResponseDto,
  UpdateCartItemDto,
} from "../dtos/cart/cartItems.dto";

import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";

import {
  addCartItem as addCartItemRepository,
  deleteCart,
  deleteCartItem,
  getCart,
  getCartItemByProductId,
  getCartItems as getCartItemsRepository,
  getOrCreateCart,
  lockCart,
  sumTotal,
  updateCartItem,
} from "../repositories/cart.repository";

import { getProductById } from "./product.service";

/**
 * Get cart.
 *
 * Read-only operation.
 * No transaction is necessary here.
 */
export const getCartItems = async (
  userId: number,
): Promise<CartItemsResponseDto> => {
  const cart = await getCart(userId);

  if (!cart) {
    return {
      cartId: null,
      items: [],
      total: 0,
    };
  }

  const items = await getCartItemsRepository(cart.id);
  const total = await sumTotal(cart.id);

  return {
    cartId: cart.id,

    items: items.map((item) => ({
      itemId: item.item_id,
      productId: item.product_id,
      productName: item.product_name,
      productPrice: Number(item.product_price),
      quantity: item.item_quantity,
      subTotal: Number(item.sub_total),
    })),

    total,
  };
};

/**
 * Add a product to cart.
 *
 * Important concurrency rule:
 *
 * BEGIN
 *   Lock/Create cart
 *   Validate product
 *   Read cart item
 *   Insert/update cart item
 * COMMIT
 *
 * Checkout uses the same cart lock, therefore checkout
 * cannot execute simultaneously with this mutation.
 */
export const addCartItem = async (
  userId: number,
  { productId, quantity }: AddCartItemDto,
): Promise<AddCartItemResponseDto> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cart = await getOrCreateCart(client, userId);

    const product = await getProductById(productId);

    // getProductById (service) already throws NotFoundError
    // if the product is null, hidden, or deleted (filtered by SQL).

    if (product.quantity < quantity) {
      throw new BadRequestError("The required quantity is not available");
    }

    const existingItem = await getCartItemByProductId(
      client,
      cart.id,
      productId,
    );

    if (!existingItem) {
      const createdItem = await addCartItemRepository(
        client,
        cart.id,
        productId,
        quantity,
      );

      await client.query("COMMIT");

      return {
        message: "Cart item added successfully",

        cartItem: {
          id: createdItem.id,
          productId: createdItem.product_id,
          quantity: createdItem.item_quantity,
        },
      };
    }

    const newQuantity = existingItem.item_quantity + quantity;

    if (newQuantity > product.quantity) {
      throw new BadRequestError("The required quantity is not available");
    }

    const updatedItem = await updateCartItem(
      client,
      existingItem.item_id,
      newQuantity,
    );

    if (!updatedItem) {
      throw new NotFoundError("The cart item not found");
    }

    await client.query("COMMIT");

    return {
      message: "Cart item quantity updated successfully",

      cartItem: {
        id: updatedItem.id,
        productId: updatedItem.product_id,
        quantity: updatedItem.item_quantity,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Replace cart item quantity.
 */
export const updateCartItemQuantity = async (
  userId: number,
  productId: number,
  { quantity }: UpdateCartItemDto,
): Promise<{
  message: string;
  cartItem: CartItemMutationResponseDto;
}> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cart = await lockCart(client, userId);

    if (!cart) {
      throw new NotFoundError("The cart not found");
    }

    const cartItem = await getCartItemByProductId(client, cart.id, productId);

    if (!cartItem) {
      throw new NotFoundError("The cart item not found");
    }

    if (quantity > cartItem.product_quantity) {
      throw new BadRequestError("The required quantity is not available");
    }

    const updatedItem = await updateCartItem(
      client,
      cartItem.item_id,
      quantity,
    );

    if (!updatedItem) {
      throw new NotFoundError("The cart item not found");
    }

    await client.query("COMMIT");

    return {
      message: "Cart item updated successfully",

      cartItem: {
        id: updatedItem.id,
        productId: updatedItem.product_id,
        quantity: updatedItem.item_quantity,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete one cart item.
 */
export const removeCartItem = async (
  userId: number,
  productId: number,
): Promise<{ message: string }> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cart = await lockCart(client, userId);

    if (!cart) {
      throw new NotFoundError("The cart not found");
    }

    const cartItem = await getCartItemByProductId(client, cart.id, productId);

    if (!cartItem) {
      throw new NotFoundError("The cart item not found");
    }

    const deletedItem = await deleteCartItem(client, cartItem.item_id);

    if (!deletedItem) {
      throw new NotFoundError("The cart item not found");
    }

    await client.query("COMMIT");

    return {
      message: "Cart item deleted successfully",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete the entire cart.
 */
export const removeCart = async (
  userId: number,
): Promise<{ message: string }> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cart = await lockCart(client, userId);

    if (!cart) {
      throw new NotFoundError("The cart not found");
    }

    const deletedCart = await deleteCart(client, cart.id);

    if (!deletedCart) {
      throw new NotFoundError("The cart not found");
    }

    await client.query("COMMIT");

    return {
      message: "Cart deleted successfully",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
