//order.repository.ts

import pool from "../config/db";
import { PoolClient } from "pg";

import {
  allowedSortOrders,
  ordersALlowedSorting,
} from "../constants/allowed-sorting";
import { OrdersParamsDto } from "../dtos/order/params.dto";
import { OrdersQueryDto } from "../dtos/order/query.dto";
import { GetOrder } from "../types/database/order/order.row";

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

// get order by order id and user id

export const getOrderByOrderIdAndUserId = async (
  { orderId }: OrdersParamsDto,
  userId: number,
) => {
  const result = await pool.query<GetOrder>(
    `select * from orders where id = $1 and user_id = $2`,
    [orderId, userId],
  );

  return result.rows[0];
};

export const getOrderForUpdateOwnedByUser = async (
  client: PoolClient,
  orderId: number,
  userId: number,
) => {
  const result = await client.query<{
    id: number;
    user_id: number;
    status: string;
  }>(
    `SELECT id, user_id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE;`,
    [orderId, userId],
  );
  return result.rows[0];
};

export const cancelOrderRow = async (client: PoolClient, orderId: number) => {
  await client.query(`UPDATE orders SET status = 'CANCELLED' WHERE id = $1;`, [
    orderId,
  ]);
};
