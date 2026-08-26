//orderItems.repository.ts

import { PoolClient } from "pg";
import pool from "../config/db";
import {
  orderItemsALlowedSorting,
  allowedSortOrders,
} from "../constants/allowed-sorting";
import { OrderItemStatus } from "../constants/allowed-status.transactions";
import { OrdersParamsDto } from "../dtos/order/params.dto";
import { OrdersQueryDto } from "../dtos/order/query.dto";
import { NotFoundError } from "../errors/not-found-error";
import { UpdatedOrderItemStatusRow } from "../types/database/order/update.row";

// get order item by order id

export const getOrderItemsByOrderId = async (
  { orderId }: OrdersParamsDto,
  query: OrdersQueryDto,
) => {
  if (!orderId) {
    throw new NotFoundError("The route is not valid");
  }
  const {
    page,
    limit,
    minItemPrice,
    maxItemPrice,
    orderItemsSorting,
    sortOrder,
  } = query;

  const sortColumn = orderItemsALlowedSorting[orderItemsSorting];
  const sortOrderColumn = allowedSortOrders[sortOrder];

  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [orderId, limit, offset];
  if (minItemPrice !== undefined) {
    values.push(minItemPrice);
    conditions.push(`oi.item_price >= $${values.length}`);
  }
  if (maxItemPrice !== undefined) {
    values.push(maxItemPrice);
    conditions.push(`oi.item_price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";

  const result = await pool.query(
    `select id, product_id, quantity, item_price, status from order_items oi where order_id = $1 ${whereClause}
    order by ${sortColumn} ${sortOrderColumn}, id ASC limit $2 offset $3;`,
    [...values],
  );

  return result.rows;
};

//count all order items

export const countAllOrderItems = async (
  { orderId }: OrdersParamsDto,
  query: OrdersQueryDto,
) => {
  if (!orderId) {
    throw new NotFoundError("The route is not valid");
  }
  const { maxItemPrice, minItemPrice } = query;
  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [orderId];
  if (minItemPrice !== undefined) {
    values.push(minItemPrice);
    conditions.push(`oi.item_price >= $${values.length}`);
  }
  if (maxItemPrice !== undefined) {
    values.push(maxItemPrice);
    conditions.push(`oi.item_price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";

  const result = await pool.query(
    `select count(oi.id) from order_items oi where order_id = $1 ${whereClause};`,
    [...values],
  );
  const totalItems = Number(result.rows[0].count);
  return { totalItems };
};

//update order items status

export const updateOrderItemStatusByOrderItemIdAndSellerId = async (
  orderItemId: number,
  sellerUserId: number,
  status: OrderItemStatus,
  allowedCurrentStatuses: OrderItemStatus[],
): Promise<UpdatedOrderItemStatusRow | undefined> => {
  const result = await pool.query<UpdatedOrderItemStatusRow>(
    `
      UPDATE order_items AS oi
      SET
        status = $1::order_item_status,
        updated_at = NOW()
      FROM products AS p
      INNER JOIN stores AS s
        ON s.id = p.store_id
      INNER JOIN seller_profiles AS sp
        ON sp.id = s.seller_profile_id
      WHERE oi.id = $2
        AND oi.product_id = p.id
        AND sp.user_id = $3
        AND oi.status = ANY($4::order_item_status[])
      RETURNING
        oi.id,
        oi.product_id,
        oi.status;
    `,
    [status, orderItemId, sellerUserId, allowedCurrentStatuses],
  );

  return result.rows[0];
};

export const areAllOrderItemsDelivered = async (
  client: PoolClient,
  orderId: number,
): Promise<boolean> => {
  const result = await client.query<{ not_delivered: string }>(
    `
      SELECT COUNT(*) FILTER (WHERE status <> 'DELIVERED') AS not_delivered
      FROM order_items
      WHERE order_id = $1;
    `,
    [orderId],
  );

  return Number(result.rows[0].not_delivered) === 0;
};

export const hasDeliveredItems = async (
  client: PoolClient,
  orderId: number,
): Promise<boolean> => {
  const result = await client.query<{ delivered_count: string }>(
    `SELECT COUNT(*) FILTER (WHERE status = 'DELIVERED') AS delivered_count FROM order_items WHERE order_id = $1;`,
    [orderId],
  );
  return Number(result.rows[0].delivered_count) > 0;
};

export const cancelOrderItemsByOrderId = async (
  client: PoolClient,
  orderId: number,
) => {
  await client.query(
    `UPDATE order_items SET status = 'CANCELLED', updated_at = NOW() WHERE order_id = $1 AND status <> 'DELIVERED';`,
    [orderId],
  );
};
