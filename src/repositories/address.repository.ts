//address.repository.ts

import pool from "../config/db";
import { PoolClient } from "pg";
import {
  AddressRow,
  AddressRowId,
} from "../types/database/checkout/checkout.row";

// Get user's address id

export const getAddressId = async (
  client: PoolClient,
  userId: number,
  addressId: number,
): Promise<AddressRowId | undefined> => {
  const result = await client.query<AddressRow>(
    `
      SELECT id
      FROM addresses
      WHERE id = $1
        AND user_id = $2;
    `,
    [addressId, userId],
  );

  return result.rows[0];
};

// Get user's address id

export const getAddress = async (
  client: PoolClient,
  userId: number,
  addressId: number,
): Promise<AddressRow> => {
  const result = await client.query<AddressRow>(
    `
      SELECT *
      FROM addresses
      WHERE id = $1
        AND user_id = $2;
    `,
    [addressId, userId],
  );

  return result.rows[0];
};
