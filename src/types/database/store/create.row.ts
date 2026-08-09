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
export interface StoreRow {
  id: number;
  name: string;
  status: StoreStatus;
}

export interface StoreProductRow {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  created_at: Date;
  updated_at: Date;
}
