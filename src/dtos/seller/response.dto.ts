// response.dto.ts

import { SellerStatus } from "../../constants/status.js";

export interface ResponseSellerDto {
  id: number;
  bankName: string;
  status: SellerStatus;
}
