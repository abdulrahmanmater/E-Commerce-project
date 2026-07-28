// user.repository

import pool from "../config/db";
import { CreateUserDto } from "../dtos/user/create.dto";
import { UserRow, UserRowWithPassword } from "../types/database/user/user.row";
import { UpdateUserRow } from "../types/database/user/update-user.row";
import { UserRole } from "../types/shared/status.js";
import { PoolClient } from "pg";

//CreateUser
export const createUser = async (user: CreateUserDto) => {
  const result = await pool.query<UserRow>(
    `
        Insert into users (full_name, email, password_hash)
        values ($1, $2, $3)
        returning id,full_name, email, role
    `,
    [user.fullname, user.email, user.password],
  );
  return result.rows[0];
};

//findUserByEmail

export const findUserByEmail = async (email: string) => {
  const existedUser = await pool.query<UserRowWithPassword>(
    `
            SELECT id, full_name, email, role, password_hash FROM users WHERE email = $1
        `,
    [email],
  );
  if (existedUser.rowCount === 0) {
    return null;
  }
  return existedUser.rows[0];
};

//findUserById

export const findUserById = async (id: number) => {
  const user = await pool.query<UserRow>(
    `
        SELECT id, full_name, email, role FROM users WHERE id = $1
    `,
    [id],
  );
  return user.rows[0];
};

//findUser in transaction
export const findUser = async (client: PoolClient, id: number) => {
  const user = await client.query<UserRow>(
    `
        SELECT id, full_name, email, role FROM users WHERE id = $1
    `,
    [id],
  );
  return user.rows[0];
};

// update user

export const updateUser = async (
  id: number,
  data: UpdateUserRow,
): Promise<UserRow | undefined> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  Object.entries(data).forEach(([key, value]) => {
    updates.push(`${key} = $${values.length + 1}`);
    values.push(value);
  });
  values.push(id);
  const result = await pool.query<UserRow>(
    `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE id = $${values.length}
        RETURNING id, full_name, email, role
    `,
    values,
  );

  return result.rows[0];
};

//delete user

export const deleteUser = async (id: number): Promise<UserRow | undefined> => {
  const result = await pool.query<UserRow>(
    `delete from users where id = $1 returning id, full_name, email, role`,
    [id],
  );
  return result.rows[0];
};

//update user role

export const updateUserRole = async (
  client: PoolClient,
  id: number,
  role: UserRole,
) => {
  const result = await client.query<UserRow>(
    `
        UPDATE users
        SET role = $1
        WHERE id = $2
        RETURNING id, full_name, email, role
    `,
    [role, id],
  );
  return result.rows[0];
};
