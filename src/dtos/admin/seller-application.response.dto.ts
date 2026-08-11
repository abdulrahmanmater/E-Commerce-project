//response.dto.ts

import {
  SellerStatus,
  StoreStatus,
  UserRole,
} from "../../types/shared/status.js";

export interface ResponseStoreDto {
  id: number;
  name: string;
  sellerId: number;
  status: StoreStatus;
}
export interface AdminSellerApplicationResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  nationalId: string;
  nationalIdImage: string;
  bankName: string;
  storeName: string;
  status: SellerStatus;
  storeStatus: StoreStatus;
}

export interface AdminUserResponseDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AdminSellerStatusResponseDto {
  id: number;
  bankName: string;
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
