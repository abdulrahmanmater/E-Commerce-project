// login.dto.ts

import { UserRole } from "../../types/shared/status.js";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  message: string;
  user: LoginUserResponseDto;
  tokens: {
    accessToken: string;
  };
}

export interface LoginUserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}
