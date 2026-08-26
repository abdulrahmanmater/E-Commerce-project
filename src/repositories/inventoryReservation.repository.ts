// inventoryReservation.repository.ts

import { PoolClient } from "pg";

// Release active inventory reservations for an order.
export const releaseInventoryReservationsByOrderId = async (
  client: PoolClient,
  orderId: number,
): Promise<void> => {
  await client.query(
    `
      UPDATE inventory_reservations ir
      SET
        status = 'RELEASED',
        updated_at = NOW()
      FROM order_items oi
      WHERE ir.order_item_id = oi.id
        AND oi.order_id = $1
        AND ir.status = 'ACTIVE';
    `,
    [orderId],
  );
};

// Consume active inventory reservations for an order.
export const consumeInventoryReservationsByOrderId = async (
  client: PoolClient,
  orderId: number,
): Promise<{ product_id: number; quantity: number }[]> => {
  const result = await client.query<{
    product_id: number;
    quantity: number;
  }>(
    `
      UPDATE inventory_reservations ir
      SET
        status = 'CONSUMED',
        updated_at = NOW()
      FROM order_items oi
      WHERE ir.order_item_id = oi.id
        AND oi.order_id = $1
        AND ir.status = 'ACTIVE'
      RETURNING
        oi.product_id,
        ir.quantity;
    `,
    [orderId],
  );

  return result.rows;
};

// Returns true only when there are no ACTIVE reservations
// that are still valid for the order.
export const isOrderReservationExpired = async (
  client: PoolClient,
  orderId: number,
): Promise<boolean> => {
  const result = await client.query<{ active_unexpired: string }>(
    `
      SELECT COUNT(*) FILTER (
        WHERE ir.status = 'ACTIVE'
          AND ir.expired_at > NOW()
      ) AS active_unexpired
      FROM inventory_reservations ir
      INNER JOIN order_items oi
        ON oi.id = ir.order_item_id
      WHERE oi.order_id = $1;
    `,
    [orderId],
  );

  return Number(result.rows[0].active_unexpired) === 0;
};

// Mark all currently active reservations of an order as expired.
export const expireInventoryReservationsByOrderId = async (
  client: PoolClient,
  orderId: number,
): Promise<void> => {
  await client.query(
    `
      UPDATE inventory_reservations ir
      SET
        status = 'EXPIRED',
        updated_at = NOW()
      FROM order_items oi
      WHERE ir.order_item_id = oi.id
        AND oi.order_id = $1
        AND ir.status = 'ACTIVE'
        AND ir.expired_at <= NOW();
    `,
    [orderId],
  );
};
