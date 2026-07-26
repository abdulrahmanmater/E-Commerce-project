// user.repository

import pool from "../config/db";
import { CreateUserDto } from "../dtos/user/create-user.dto";
import { UserRow, UserRowWithPassword } from "../types/database/user.row";
import { LoginRequestDto } from "../dtos/auth/login.dto";

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

export const findUserByEmail = async (user: LoginRequestDto) => {
  const existedUser = await pool.query<UserRowWithPassword>(
    `
            SELECT id, full_name, email, role, password_hash FROM users WHERE email = $1
        `,
    [user.email],
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
