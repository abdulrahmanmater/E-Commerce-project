// product.repository

import pool from "../config/db";

export const getStore = async (store_id: number) => {
  const result = await pool.query(
    `
        select id, name, status from stores where id = $1 and deleted_at is null;
    `,
    [store_id],
  );
  return result.rows[0];
};

// get products by store id

export const getProductsByStoreId = async (store_id: number) => {
  const result = await pool.query(
    `
        select id, name, price, quantity, description, created_at, updated_at from products where store_id = $1 and is_hidden = false and deleted_at is null;
    `,
    [store_id],
  );
  return result.rows;
};
