//admin.repository.ts

import { PoolClient } from "pg";
import pool from "../config/db";
import { SellerStatus, StoreStatus } from "../types/shared/status.js";
import {
  AdminSellerApplicationByUserIdRow,
  AdminSellerApplicationRow,
  LockedAdminUserRow,
  LockedSellerProfileRow,
  LockedStoreRow,
  SellerApplicationDetailsRow,
  UpdatedSellerProfileStatusRow,
  UpdatedStoreStatusRow,
} from "../types/database/admin/admin.row.js";

// get seller applications

export const getSellerApplications = async () => {
  const applications = await pool.query<AdminSellerApplicationRow>(
    `
            SELECT u.id AS user_id, u.full_name, u.email, u.role, sp.national_id, sp.national_id_image, sp.bank_name, s.name AS store_name, sp.status AS seller_status, s.status AS store_status
            FROM seller_profiles sp inner join users u on u.id = sp.user_id 
            inner join stores s on s.seller_profile_id =sp.id WHERE sp.status = 'PENDING';
        `,
  );
  return applications.rows;
};

//get seller application by user id

export const getSellerApplicationByUserId = async (id: number) => {
  const applications = await pool.query<AdminSellerApplicationByUserIdRow>(
    `
            SELECT u.id AS user_id, u.full_name, u.email, u.role, sp.national_id, sp.national_id_image, sp.bank_name, s.name AS store_name, sp.status AS seller_status, s.status AS store_status
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
  const applications = await client.query<SellerApplicationDetailsRow>(
    `
            SELECT u.full_name AS user_full_name, u.id AS user_id, sp.id AS seller_profile_id, sp.national_id, sp.national_id_image, sp.bank_name, s.name AS store_name, sp.status AS seller_status
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
  const result = await client.query<UpdatedSellerProfileStatusRow>(
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
  const result = await client.query<UpdatedStoreStatusRow>(
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
  const result = await client.query<LockedAdminUserRow>(
    `SELECT id, full_name, email, role FROM users WHERE id = $1 FOR UPDATE`,
    [userId],
  );
  return result.rows[0];
};
export const lockStore = async (client: PoolClient, sellerId: number) => {
  const result = await client.query<LockedStoreRow>(
    `SELECT * FROM stores WHERE seller_profile_id = $1 FOR UPDATE`,
    [sellerId],
  );
  return result.rows[0];
};

export const lockSellerProfile = async (client: PoolClient, userId: number) => {
  const result = await client.query<LockedSellerProfileRow>(
    `SELECT * FROM seller_profiles WHERE id = $1 FOR UPDATE`,
    [userId],
  );
  return result.rows[0];
};
