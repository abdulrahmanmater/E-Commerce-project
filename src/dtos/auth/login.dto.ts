// login.dto.ts

import { UserResponseDto } from "../user/user.response.dto.js";
import { UserRole } from "../../types/shared/status.js";
export interface LoginRequestDto {
  id?: number;
  email: string;
  password: string;
}
export interface LoginResponseDto {
  message: string;
  user?: UserResponseDto;
}
export interface UserWithPassword {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}
