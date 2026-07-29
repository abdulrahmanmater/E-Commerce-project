import { SellerStatus, StoreStatus, UserRole } from "../../types/shared/status.js";

export interface AdminSellerApplicationResponseDto {
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

export interface AdminUserResponseDto {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface AdminSellerStatusResponseDto {
  id: number;
  bank_name: string;
  status: SellerStatus;
}

export interface AdminStoreStatusResponseDto {
  id: number;
  name: string;
  status: StoreStatus;
}

export interface ApproveRejectSellerApplicationResponseDto {
  message: string;
  user: AdminUserResponseDto | undefined;
  seller: AdminSellerStatusResponseDto | undefined;
  store: AdminStoreStatusResponseDto | undefined;
}
