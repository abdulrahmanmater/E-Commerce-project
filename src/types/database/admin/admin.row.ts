// admin.row.ts — Row types for admin repository queries

import { SellerStatus, StoreStatus, UserRole } from "../../shared/status.js";

/** Row from getSellerApplications / getSellerApplicationByUserId JOIN query */
export interface SellerApplicationRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  national_id: string;
  national_id_image: string;
  bank_name: string;
  store_name: string;
  status: SellerStatus;
  store_status: StoreStatus;
}

/** Row from getSellerApplication (transactional) JOIN query */
export interface SellerApplicationDetailRow {
  full_name: string;
  user_id: number;
  seller_profile_id: number;
  national_id: string;
  national_id_image: string;
  bank_name: string;
  store_name: string;
  status: SellerStatus;
}

/** RETURNING row from changeSellerProfileStatus */
export interface SellerProfileStatusRow {
  id: number;
  bank_name: string;
  status: SellerStatus;
}

/** RETURNING row from changeStoreStatus */
export interface StoreStatusRow {
  id: number;
  name: string;
  status: StoreStatus;
}
