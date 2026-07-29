// store.row

import { StoreStatus } from "../../shared/status.js";

export interface CreateStoreData {
  name: string;
}

export interface CreatedStoreRow {
  id: number;
  name: string;
  seller_profile_id: number;
  status: StoreStatus;
}
