//admin.repository.ts

import { PoolClient } from "pg";
import pool from "../config/db";
import { StoreStatus } from "../dtos/store/response.dto";
import { SellerStatus } from "../dtos/seller/response.dto";

// get seller applications

export const getSellerApplications = async () => {
  const applications = await pool.query(
    `
            SELECT  u.id, full_name, email, role, national_id, national_id_image, bank_name, name store_name, sp.status, s.status store_status
            FROM seller_profiles sp inner join users u on u.id = sp.user_id 
            inner join stores s on s.seller_profile_id =sp.id WHERE sp.status = 'PENDING';
        `,
  );
  return applications.rows;
};

//get seller application by user id

export const getSellerApplicationByUserId = async (id: number) => {
  const applications = await pool.query(
    `
            SELECT  u.id, full_name, email, role, national_id, national_id_image, bank_name, name store_name, sp.status, s.status store_status
            FROM seller_profiles sp inner join users u on u.id = sp.user_id 
            inner join stores s on s.seller_profile_id =sp.id where u.id = $1 and sp.status = 'PENDING';
        `,
    [id],
  );
  if (applications.rowCount === 0) {
    return null;
  }
  return applications.rows[0];
};
export const getSellerApplication = async (client: PoolClient, id: number) => {
  const applications = await client.query(
    `
            SELECT  full_name, u.id user_id,sp.id seller_profile_id, national_id, national_id_image, bank_name, name store_name, sp.status 
            FROM seller_profiles sp inner join users u on u.id = sp.user_id 
            inner join stores s on s.seller_profile_id =sp.id where u.id = $1 for update;
        `,
    [id],
  );
  if (applications.rowCount === 0) {
    return null;
  }
  return applications.rows[0];
};

export const changeSellerProfileStatus = async (
  client: PoolClient,
  seller_id: number,
  status: SellerStatus,
) => {
  const result = await client.query(
    `
    UPDATE seller_profiles
    SET status = $1
    WHERE id = $2
    RETURNING
      id,
      bank_name,
      status;
    `,
    [status, seller_id],
  );
  return result.rows[0];
};

export const changeStoreStatus = async (
  client: PoolClient,
  seller_id: number,
  status: StoreStatus,
) => {
  const result = await client.query(
    `
    UPDATE stores
    SET status = $1
    WHERE seller_profile_id = $2
    RETURNING
      id,
      name,
      status;
    `,
    [status, seller_id],
  );
  return result.rows[0];
};

export const lockUser = async (client: PoolClient, userId: number) => {
  const result = await client.query(
    `SELECT * FROM users WHERE id = $1 FOR UPDATE`,
    [userId],
  );
  return result.rows[0];
};
export const lockStore = async (client: PoolClient, sellerId: number) => {
  const result = await client.query(
    `SELECT * FROM stores WHERE seller_profile_id = $1 FOR UPDATE`,
    [sellerId],
  );
  return result.rows[0];
};

export const lockSellerProfile = async (client: PoolClient, userId: number) => {
  const result = await client.query(
    `SELECT * FROM seller_profiles WHERE id = $1 FOR UPDATE`,
    [userId],
  );
  return result.rows[0];
};
