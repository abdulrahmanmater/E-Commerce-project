//user.response.dto

import { UserRole } from "../../types/shared/status.js";

export interface UserResponseDto {
  id: number;
  fullname: string;
  email: string;
  role: UserRole;
}
