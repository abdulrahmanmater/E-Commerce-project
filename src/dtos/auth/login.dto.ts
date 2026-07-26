// login.dto.ts

import { UserResponseDto, UserRole } from "../user/user.response.dto";
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
