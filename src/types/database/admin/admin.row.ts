// admin.row.ts — Row types for admin repository queries

import { SellerStatus, StoreStatus, UserRole } from "../../shared/status.js";

/** Row from getSellerApplications JOIN query */
export interface AdminSellerApplicationRow {
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

/** Row from getSellerApplicationByUserId JOIN query */
export interface AdminSellerApplicationByUserIdRow {
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

/** Row from getSellerApplication transactional JOIN query */
export interface SellerApplicationDetailsRow {
  user_full_name: string;
  user_id: number;
  seller_profile_id: number;
  national_id: string;
  national_id_image: string;
  bank_name: string;
  store_name: string;
  seller_status: SellerStatus;
}

/** RETURNING row from changeSellerProfileStatus */
export interface UpdatedSellerProfileStatusRow {
  id: number;
  bank_name: string;
  status: SellerStatus;
}

/** RETURNING row from changeStoreStatus */
export interface UpdatedStoreStatusRow {
  id: number;
  name: string;
  status: StoreStatus;
}

export interface LockedAdminUserRow {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface LockedStoreRow {
  id: number;
  seller_profile_id: number;
  name: string;
  status: StoreStatus;
  created_at: Date;
  updated_at: Date;
}

export interface LockedSellerProfileRow {
  id: number;
  national_id: string;
  national_id_image: string;
  bank_account_number: string;
  bank_name: string;
  status: SellerStatus;
  created_at: Date;
  updated_at: Date;
  user_id: number;
}
