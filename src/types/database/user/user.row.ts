// user.row

import { UserRole } from "../../shared/status.js";

export interface UserRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface UserRowWithPassword {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}
