import { UserRole } from "../../shared/status.js";

export interface CreatedUserRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface UserByEmailRow {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

export interface UserByIdRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface TransactionUserRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface UpdatedUserRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface DeletedUserRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface UpdatedUserRoleRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}
