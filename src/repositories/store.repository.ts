// store.repository

import { PoolClient } from "pg";
import pool from "../config/db";
import {
  productsAllowedSorting,
  allowedSortOrders,
} from "../constants/allowed-sorting";
import { ProductsQueryDto } from "../dtos/product/query.dto";
import { StoreProductRow, StoreRow } from "../types/database/store/create.row";
import { CheckoutStoreRow } from "../types/database/checkout/checkout.row";

export const getStore = async (storeId: number) => {
  const result = await pool.query<StoreRow>(
    `
        select id, name, status from stores where id = $1 and deleted_at is null;
    `,
    [storeId],
  );
  return result.rows[0];
};

// get products by store id

export const getProductsByStoreId = async (
  storeId: number,
  query: ProductsQueryDto,
) => {
  let queryStatement = `select p.id, p.name, p.price, p.quantity, p.description, p.created_at, p.updated_at from products p `;
  const { page, limit, category, minPrice, maxPrice, sorting, sortOrder } =
    query;
  const sortColumn = productsAllowedSorting[sorting];
  const sortOrderColumn = allowedSortOrders[sortOrder];
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number)[] = [storeId, limit, offset];
  if (category) {
    values.push(category);

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM product_categories pc
        INNER JOIN categories c
          ON c.id = pc.category_id
        WHERE pc.product_id = p.id
          AND c.name = $${values.length}
      )
    `);
  }

  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`p.price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";
  queryStatement += `where p.store_id = $1 and p.is_hidden = false and p.deleted_at is null ${whereClause}
        ORDER BY ${sortColumn} ${sortOrderColumn}, p.id ASC limit $2 offset $3;`;
  const result = await pool.query<StoreProductRow>(queryStatement, [...values]);
  return result.rows;
};

// count store products

export const countStoreProducts = async (
  storeId: number,
  query: ProductsQueryDto,
) => {
  const { category, minPrice, maxPrice } = query;
  let queryStatement = `    select COUNT(DISTINCT p.id)
        from products p `;
  const conditions: string[] = [];
  const values: (string | number)[] = [storeId];
  if (category) {
    values.push(category);

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM product_categories pc
        INNER JOIN categories c
          ON c.id = pc.category_id
        WHERE pc.product_id = p.id
          AND c.name = $${values.length}
      )
    `);
  }
  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`p.price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";
  queryStatement += ` where p.store_id = $1 
        and p.is_hidden = false and p.deleted_at is null ${whereClause};`;
  const result = await pool.query<{ count: string }>(queryStatement, [
    ...values,
  ]);
  const totalItems = Number(result.rows[0].count);
  return { totalItems };
};

// =========================
// Find stores by IDs
// =========================

export const findALllStoresByStoresId = async (
  client: PoolClient,
  storesId: number[],
): Promise<CheckoutStoreRow[]> => {
  const result = await client.query<CheckoutStoreRow>(
    `
      SELECT
        id,
        status,
        name,
        deleted_at
      FROM stores
      WHERE id = ANY($1::int[]);
    `,
    [storesId],
  );

  return result.rows;
};
