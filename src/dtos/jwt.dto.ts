//jwt.dto

import { UserRole } from "../constants/status.js";

export interface TokenPayload {
  id: number;
  role: UserRole;
}
