//jwt.dto

import { UserRole } from "../types/shared/status.js";

export interface TokenPayload {
  id: number;
  role: UserRole;
}
