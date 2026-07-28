// store.row

import { StoreStatus } from "../../shared/status.js";

export interface StoreRow {
  name: string;
}

export interface StoreRowResponse {
  id: number;
  name: string;
  seller_profile_id: number;
  status: StoreStatus;
}
