//checkout.repository.ts

import { PoolClient } from "pg";
import {
  LockedProductRow,
  CreatedOrderRow,
  CreatedOrderItemRow,
  DecreasedStockRow,
} from "../types/database/checkout/checkout.row";
import { ConflictError } from "../errors/conflict-error";

// Lock products + read cart

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

// Lock cart

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

// Create order

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
        total_price
      )
      VALUES ($1, $2, $3)
      RETURNING *;
    `,
    [userId, addressId, totalPrice],
  );

  return result.rows[0];
};

// Create order items
export const createOrderItems = async (
  client: PoolClient,
  orderId: number,
  items: {
    productId: number;
    quantity: number;
    productPrice: number;
  }[],
): Promise<CreatedOrderItemRow[]> => {
  const values: number[] = [];
  const placeholders: string[] = [];

  items.forEach((item, index) => {
    const base = index * 4;

    placeholders.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`,
    );

    values.push(orderId, item.productId, item.quantity, item.productPrice);
  });

  const result = await client.query<CreatedOrderItemRow>(
    `
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        item_price
      )
      VALUES ${placeholders.join(", ")}
      RETURNING
        id,
        product_id,
        quantity,
        item_price;
    `,
    values,
  );

  return result.rows;
};

// Decrease stock

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
      throw new ConflictError(
        `Failed to decrease stock for product ${product.productId}`,
      );
    }
  }
};

// Delete cart items

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

//create inventory reservations

export const createInventoryReservations = async (
  client: PoolClient,
  reservations: {
    orderItemId: number;
    quantity: number;
  }[],
) => {
  if (reservations.length === 0) {
    return [];
  }

  const values: (number | string)[] = [];

  const rows = reservations
    .map((reservation, index) => {
      const base = index * 2;

      values.push(reservation.orderItemId, reservation.quantity);

      return `($${base + 1}, $${base + 2},  NOW() + INTERVAL '15 minutes')`;
    })
    .join(", ");
  await client.query(
    `
    insert into inventory_reservations 
    (order_item_id, quantity, expired_at)
    values ${rows}

    `,
    [...values],
  );
};

// get available stocks

type AvailableStock = {
  product_id: number;
  available_stock: number;
};

export const getAvailableStocks = async (
  client: PoolClient,
  productIds: number[],
): Promise<AvailableStock[]> => {
  const result = await client.query<AvailableStock>(
    `
      SELECT
        p.id AS product_id,
        p.quantity -
        COALESCE(
          SUM(
            CASE
              WHEN ir.status = 'ACTIVE'
                AND ir.expired_at > NOW()
              THEN ir.quantity
              ELSE 0
            END
          ),
          0
        ) AS available_stock
      FROM products p
      LEFT JOIN order_items oi
        ON oi.product_id = p.id
      LEFT JOIN inventory_reservations ir
        ON oi.id = ir.order_item_id
      WHERE p.id = ANY($1::int[])
      GROUP BY p.id, p.quantity;
    `,
    [productIds],
  );

  return result.rows;
};
