// cart.repository.ts

import { PoolClient } from "pg";
import pool from "../config/db";

import {
  CartItemMutationRow,
  CartItemRow,
  CartRow,
  CartTotalRow,
  DeletedCartItemRow,
  DeletedCartRow,
} from "../types/cart/create.row";

/**
 * Get cart without locking it.
 *
 * Used for read-only operations such as GET /carts.
 */
export const getCart = async (userId: number): Promise<CartRow | undefined> => {
  const result = await pool.query<CartRow>(
    `
      SELECT id
      FROM carts
      WHERE user_id = $1
    `,
    [userId],
  );

  return result.rows[0];
};

/**
 * Get the user's cart and lock it.
 *
 * This is used inside a transaction for cart mutations
 * and checkout.
 */
export const lockCart = async (
  client: PoolClient,
  userId: number,
): Promise<CartRow | undefined> => {
  const result = await client.query<CartRow>(
    `
      SELECT id
      FROM carts
      WHERE user_id = $1
      FOR UPDATE
    `,
    [userId],
  );

  return result.rows[0];
};

/**
 * Create a cart if it does not exist.
 *
 * Important:
 * ON CONFLICT DO NOTHING + RETURNING can return zero rows.
 * Therefore, this function handles both cases by selecting
 * the cart after the insert attempt.
 */
export const getOrCreateCart = async (
  client: PoolClient,
  userId: number,
): Promise<CartRow> => {
  const inserted = await client.query<CartRow>(
    `
      INSERT INTO carts (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `,
    [userId],
  );

  if (inserted.rows[0]) {
    return inserted.rows[0];
  }

  const existing = await client.query<CartRow>(
    `
      SELECT id
      FROM carts
      WHERE user_id = $1
      FOR UPDATE
    `,
    [userId],
  );

  const cart = existing.rows[0];

  if (!cart) {
    throw new Error("Cart could not be created or retrieved");
  }

  return cart;
};

/**
 * Get all cart items.
 */
export const getCartItems = async (cartId: number): Promise<CartItemRow[]> => {
  const result = await pool.query<CartItemRow>(
    `
      SELECT
        ci.id AS item_id,
        ci.cart_id,
        ci.product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.quantity AS product_quantity,
        ci.quantity AS item_quantity,
        p.price * ci.quantity AS sub_total
      FROM cart_items ci
      INNER JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC
    `,
    [cartId],
  );

  return result.rows;
};

/**
 * Get a specific cart item.
 *
 * This is intentionally scoped by cartId.
 * The service therefore cannot accidentally access another
 * user's cart item.
 */
export const getCartItemByProductId = async (
  client: PoolClient,
  cartId: number,
  productId: number,
): Promise<CartItemRow | undefined> => {
  const result = await client.query<CartItemRow>(
    `
      SELECT
        ci.id AS item_id,
        ci.cart_id,
        ci.product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.quantity AS product_quantity,
        ci.quantity AS item_quantity,
        p.price * ci.quantity AS sub_total
      FROM cart_items ci
      INNER JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
        AND ci.product_id = $2
    `,
    [cartId, productId],
  );

  return result.rows[0];
};

/**
 * Add a cart item.
 *
 * The UNIQUE(cart_id, product_id) constraint remains the
 * database-level protection against duplicate items.
 */
export const addCartItem = async (
  client: PoolClient,
  cartId: number,
  productId: number,
  quantity: number,
): Promise<CartItemMutationRow> => {
  const result = await client.query<CartItemMutationRow>(
    `
      INSERT INTO cart_items (
        cart_id,
        product_id,
        quantity
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        cart_id,
        product_id,
        quantity AS item_quantity
    `,
    [cartId, productId, quantity],
  );

  return result.rows[0];
};

/**
 * Update an existing cart item.
 */
export const updateCartItem = async (
  client: PoolClient,
  cartItemId: number,
  quantity: number,
): Promise<CartItemMutationRow | undefined> => {
  const result = await client.query<CartItemMutationRow>(
    `
      UPDATE cart_items
      SET
        quantity = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        cart_id,
        product_id,
        quantity AS item_quantity
    `,
    [quantity, cartItemId],
  );

  return result.rows[0];
};

/**
 * Calculate cart total from the current product prices.
 *
 * Product price is deliberately NOT stored in cart_items.
 * Checkout will snapshot the price into order_items.
 */
export const sumTotal = async (cartId: number): Promise<number> => {
  const result = await pool.query<CartTotalRow>(
    `
      SELECT COALESCE(
        SUM(p.price * ci.quantity),
        0
      ) AS total
      FROM cart_items ci
      INNER JOIN products p
        ON p.id = ci.product_id
      WHERE ci.cart_id = $1
    `,
    [cartId],
  );

  return Number(result.rows[0].total);
};

/**
 * Delete a cart item.
 */
export const deleteCartItem = async (
  client: PoolClient,
  cartItemId: number,
): Promise<DeletedCartItemRow | undefined> => {
  const result = await client.query<DeletedCartItemRow>(
    `
      DELETE FROM cart_items
      WHERE id = $1
      RETURNING
        quantity AS item_quantity,
        cart_id,
        product_id
    `,
    [cartItemId],
  );

  return result.rows[0];
};

/**
 * Delete the entire cart.
 *
 * cart_items are automatically deleted by:
 *
 * FK cart_items.cart_id -> carts.id
 * ON DELETE CASCADE
 */
export const deleteCart = async (
  client: PoolClient,
  cartId: number,
): Promise<DeletedCartRow | undefined> => {
  const result = await client.query<DeletedCartRow>(
    `
      DELETE FROM carts
      WHERE id = $1
      RETURNING
        id,
        user_id
    `,
    [cartId],
  );

  return result.rows[0];
};
