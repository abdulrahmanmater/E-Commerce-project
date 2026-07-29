// seller-application.row.ts — Row types for seller repository queries

import {
  SellerStatus,
  StoreStatus,
  UserRole,
} from "../../shared/status.js";

export interface SellerStatusRow {
  status: SellerStatus;
}

export interface LockedSellerUserRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

/** Row from findSellerApplicationByUserId JOIN query */
export interface SellerApplicationDetailsRow {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  national_id: string;
  national_id_image: string;
  bank_name: string;
  store_name: string;
  seller_status: SellerStatus;
  store_status: StoreStatus;
}
