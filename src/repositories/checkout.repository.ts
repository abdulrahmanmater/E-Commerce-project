//checkout.repository.ts

import { PoolClient } from "pg";
import {
  LockedProductRow,
  AddressRow,
  CreatedOrderRow,
  CreatedOrderItemRow,
  DecreasedStockRow,
} from "../types/database/checkout/checkout.row";

// =========================
// Lock products + read cart
// =========================

export const lockProducts = async (
  client: PoolClient,
  cartId: number,
): Promise<LockedProductRow[]> => {
  const result = await client.query<LockedProductRow>(
    `
      SELECT
        p.id AS product_id,
        p.store_id,
        p.name AS product_name,
        p.price AS product_price,
        p.quantity AS available_quantity,
        p.deleted_at,
        p.is_hidden,

        ci.id AS cart_item_id,
        ci.cart_id,
        ci.quantity AS requested_quantity

      FROM products p

      INNER JOIN cart_items ci
        ON ci.product_id = p.id

      WHERE ci.cart_id = $1

      ORDER BY p.id ASC

      FOR UPDATE;
    `,
    [cartId],
  );

  return result.rows;
};

// =========================
// Lock cart
// =========================

export const lockCart = async (client: PoolClient, userId: number) => {
  const result = await client.query<{ id: number }>(
    `
      SELECT id
      FROM carts
      WHERE user_id = $1
      FOR UPDATE;
    `,
    [userId],
  );

  return result.rows[0];
};

// =========================
// Get user's address
// =========================

export const getAddress = async (
  client: PoolClient,
  userId: number,
  addressId: number,
): Promise<AddressRow | undefined> => {
  const result = await client.query<AddressRow>(
    `
      SELECT id
      FROM addresses
      WHERE id = $1
        AND user_id = $2;
    `,
    [addressId, userId],
  );

  return result.rows[0];
};

// =========================
// Create order
// =========================

export const createOrder = async (
  client: PoolClient,
  userId: number,
  addressId: number,
  totalPrice: number,
): Promise<CreatedOrderRow> => {
  const result = await client.query<CreatedOrderRow>(
    `
      INSERT INTO orders (
        user_id,
        address_id,
        status,
        payment_status,
        total_price
      )
      VALUES (
        $1,
        $2,
        'PENDING',
        'PENDING',
        $3
      )
      RETURNING *;
    `,
    [userId, addressId, totalPrice],
  );

  return result.rows[0];
};

// =========================
// Create order items
// =========================

export const createOrderItems = async (
  client: PoolClient,
  orderId: number,
  items: {
    productId: number;
    quantity: number;
    productPrice: number;
  }[],
): Promise<CreatedOrderItemRow[]> => {
  const createdItems: CreatedOrderItemRow[] = [];

  for (const item of items) {
    const result = await client.query<CreatedOrderItemRow>(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          item_price
        )
        VALUES ($1, $2, $3, $4)

        RETURNING
          id,
          product_id,
          quantity,
          item_price;
      `,
      [orderId, item.productId, item.quantity, item.productPrice],
    );

    createdItems.push(result.rows[0]);
  }

  return createdItems;
};

// =========================
// Decrease stock
// =========================

export const decreaseStock = async (
  client: PoolClient,
  products: {
    productId: number;
    quantity: number;
  }[],
): Promise<void> => {
  for (const product of products) {
    const result = await client.query<DecreasedStockRow>(
      `
        UPDATE products
        SET quantity = quantity - $1
        WHERE id = $2
          AND quantity >= $1
        RETURNING id, quantity;
      `,
      [product.quantity, product.productId],
    );

    if (result.rowCount !== 1) {
      throw new Error(
        `Failed to decrease stock for product ${product.productId}`,
      );
    }
  }
};

// =========================
// Delete cart items
// =========================

export const deleteCartItems = async (
  client: PoolClient,
  cartItemsId: number[],
): Promise<void> => {
  await client.query(
    `
      DELETE FROM cart_items
      WHERE id = ANY($1::int[]);
    `,
    [cartItemsId],
  );
};
