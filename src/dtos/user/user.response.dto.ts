//user.response.dto

import { UserRole } from "../../types/shared/status.js";

export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AccessTokenResponseDto {
  accessToken: string;
}

export interface CreatedUserResponseDto {
  message: string;
  user: UserResponseDto;
  tokens: AccessTokenResponseDto;
}

export interface UserActionResponseDto {
  message: string;
  user: UserResponseDto;
}
