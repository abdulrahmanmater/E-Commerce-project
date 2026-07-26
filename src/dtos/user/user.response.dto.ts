//user.response.dto

export interface UserResponseDto {
  id: number;
  fullname: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  SELLER = "SELLER",
  ADMIN = "ADMIN",
}
