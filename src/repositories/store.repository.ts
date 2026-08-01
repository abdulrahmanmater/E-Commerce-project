// product.repository

import pool from "../config/db";

export const getStore = async (seller_profile_id: number) => {
  const result = await pool.query(
    `
        select id, name, status from stores where seller_profile_id = $1
    `,
    [seller_profile_id],
  );
  return result.rows[0];
};
