// user.repository

import pool from "../config/db";
import { CreateUserDto } from "../dtos/user/create.dto";
import {
  CreatedUserRow,
  DeletedUserRow,
  TransactionUserRow,
  UpdatedUserRoleRow,
  UpdatedUserRow,
  UserByEmailRow,
  UserByIdRow,
} from "../types/database/user/user.row";
import { UpdateUserData } from "../types/database/user/update-user.row";
import { UserRole } from "../types/shared/status.js";
import { PoolClient } from "pg";

//CreateUser
export const createUser = async (user: CreateUserDto) => {
  const result = await pool.query<CreatedUserRow>(
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
  const existedUser = await pool.query<UserByEmailRow>(
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
  const user = await pool.query<UserByIdRow>(
    `
        SELECT id, full_name, email, role FROM users WHERE id = $1
    `,
    [id],
  );
  return user.rows[0];
};

//findUser in transaction
export const findUser = async (client: PoolClient, id: number) => {
  const user = await client.query<TransactionUserRow>(
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
  data: UpdateUserData,
): Promise<UpdatedUserRow | undefined> => {
  const updates: string[] = [];
  const values: (string | number)[] = [];
  const fields = [
    { column: "full_name", value: data.full_name },
    { column: "email", value: data.email },
  ];

  for (const field of fields) {
    if (field.value !== undefined) {
      updates.push(`${field.column} = $${values.length + 1}`);
      values.push(field.value);
    }
  }
  values.push(id);
  const result = await pool.query<UpdatedUserRow>(
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

export const deleteUser = async (
  id: number,
): Promise<DeletedUserRow | undefined> => {
  const result = await pool.query<DeletedUserRow>(
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
  const result = await client.query<UpdatedUserRoleRow>(
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
