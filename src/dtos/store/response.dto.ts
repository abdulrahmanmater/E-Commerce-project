//response.dto.ts

import { StoreStatus } from "../../types/shared/status.js";

export interface ResponseStoreDto {
  id: number;
  name: string;
  sellerId: number;
  status: StoreStatus;
}
