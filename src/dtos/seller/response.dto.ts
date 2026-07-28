// response.dto.ts

import { SellerStatus } from "../../types/shared/status.js";

export interface ResponseSellerDto {
  id: number;
  bankName: string;
  status: SellerStatus;
}
