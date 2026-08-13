//order.repository.ts

import pool from "../config/db";
import { PoolClient } from "pg";

import { UpdatedOrderItemStatusRow } from "../types/database/order/update.row";
import {
  allowedSortOrders,
  orderItemsALlowedSorting,
  ordersALlowedSorting,
} from "../constants/allowed-sorting";
import { OrdersParamsDto } from "../dtos/order/params.dto";
import { OrdersQueryDto } from "../dtos/order/query.dto";
import { NotFoundError } from "../errors/not-found-error";
import { OrderItemStatus } from "../constants/allowed-status.transactions";

// Get orders

export const getOrdersByUserId = async (
  userId: number,
  query: OrdersQueryDto,
) => {
  const {
    page,
    limit,
    minTotalPrice,
    maxTotalPrice,
    ordersSorting,
    sortOrder,
  } = query;
  const sortColumn = ordersALlowedSorting[ordersSorting];
  const sortOrderColumn = allowedSortOrders[sortOrder];
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [userId, limit, offset];
  if (minTotalPrice !== undefined) {
    values.push(minTotalPrice);
    conditions.push(`o.total_price >= $${values.length}`);
  }
  if (maxTotalPrice !== undefined) {
    values.push(maxTotalPrice);
    conditions.push(`o.total_price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";

  const result = await pool.query(
    `select * from orders o where user_id = $1 ${whereClause}
    order by ${sortColumn} ${sortOrderColumn}, o.id ASC limit $2 offset $3;`,
    [...values],
  );
  return result.rows;
};

//count all orders

export const countAllOrders = async (userId: number, query: OrdersQueryDto) => {
  const { minTotalPrice, maxTotalPrice } = query;
  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [userId];
  if (minTotalPrice !== undefined) {
    values.push(minTotalPrice);
    conditions.push(`o.total_price >= $${values.length}`);
  }
  if (maxTotalPrice !== undefined) {
    values.push(maxTotalPrice);
    conditions.push(`o.total_price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";

  const result = await pool.query(
    `select count(o.id) from orders o where user_id = $1 ${whereClause};`,
    [...values],
  );
  const totalItems = Number(result.rows[0].count);
  return { totalItems };
};

// get order by order id

export const getOrderByOrderIdAndUserId = async (
  { orderId }: OrdersParamsDto,
  userId: number,
) => {
  const result = await pool.query(
    `select * from orders where id = $1 and user_id = $2`,
    [orderId, userId],
  );

  return result.rows[0];
};

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

export const updateOrderItemStatus = async (
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
