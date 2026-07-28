// store.row

export interface StoreRow {
  name: string;
}

export interface StoreRowResponse {
  id: number;
  name: string;
  seller_profile_id: number;
  status: StoreStatus;
}

export enum StoreStatus {
  PENDING = "PENDING",
  OPENED = "OPENED",
  REJECTED = "REJECTED",
  HIDDEN = "HIDDEN",
}
