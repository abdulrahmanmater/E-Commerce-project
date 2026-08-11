import {
  SellerStatus,
  StoreStatus,
  UserRole,
} from "../../types/shared/status.js";

export interface SellerApplicationDetailsDto {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
  nationalId: string;
  nationalIdImage: string;
  bankName: string;
  storeId: number;
  storeName: string;
  sellerStatus: SellerStatus;
  storeStatus: StoreStatus;
}

export interface MySellerApplicationResponseDto {
  message: string;
  application: SellerApplicationDetailsDto;
}
