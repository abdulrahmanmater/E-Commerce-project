// seller.repository.ts

import { PoolClient } from "pg";
import { SellerRowResponse } from "../types/database/seller/create.row.js";
import { StoreRowResponse } from "../types/database/store/create.row.js";
import { UserRow } from "../types/database/user/user.row.js";
import { CreateSellerRow } from "../types/database/create-seller.row.js";
import { SellerApplicationFullRow } from "../types/database/seller/seller-application.row.js";
import { SellerStatus } from "../types/shared/status.js";
import pool from "../config/db";

//get seller status

export const getSellerStatus = async (
  client: PoolClient,
  id: number,
): Promise<SellerStatus | undefined> => {
  const result = await client.query<{ status: SellerStatus }>(
    `
      select status from seller_profiles where user_id = $1
    `,
    [id],
  );
  return result.rows[0]?.status;
};

//lock user row

export const lockUser = async (client: PoolClient, userId: number) => {
  const result = await client.query<UserRow>(
    `
    SELECT id, full_name, email, role
    FROM users
    WHERE id = $1
    FOR UPDATE;
    `,
    [userId],
  );

  return result.rows[0];
};

export const createSellerProfile = async (
  client: PoolClient,
  id: number,
  data: CreateSellerRow,
) => {
  const result = await client.query<SellerRowResponse>(
    `
    INSERT INTO seller_profiles (
      national_id,
      national_id_image,
      bank_account_number,
      bank_name,
      user_id,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'PENDING')
    RETURNING
      id,
      bank_name,
      status;
    `,
    [
      data.seller.national_id,
      data.seller.national_id_image,
      data.seller.bank_account_number,
      data.seller.bank_name,
      id,
    ],
  );

  return result.rows[0];
};

export const createStore = async (
  client: PoolClient,
  sellerProfileId: number,
  storeName: string,
) => {
  const result = await client.query<StoreRowResponse>(
    `
    INSERT INTO stores (
      name,
      seller_profile_id,
      status
    )
    VALUES ($1, $2, 'PENDING')
    RETURNING
      id,
      name,
      seller_profile_id,
      status;
    `,
    [storeName, sellerProfileId],
  );

  return result.rows[0];
};

//delete seller_profile

export const deleteSellerProfile = async (
  client: PoolClient,
  userId: number,
): Promise<void> => {
  await client.query(
    `
    DELETE FROM seller_profiles
    WHERE user_id = $1
    `,
    [userId],
  );
};

//find seller application by user_id

export const findSellerApplicationByUserId = async (user_id: number) => {
  const application = await pool.query<SellerApplicationFullRow>(
    `
        SELECT u.id, u.full_name, u.email, u.role, sp.national_id, sp.national_id_image, sp.bank_name, s.name AS store_name, sp.status AS seller_status, s.status AS store_status
            FROM seller_profiles sp inner join users u on u.id = sp.user_id 
            inner join stores s on s.seller_profile_id =sp.id WHERE user_id = $1
    `,
    [user_id],
  );
  return application.rows[0];
};
