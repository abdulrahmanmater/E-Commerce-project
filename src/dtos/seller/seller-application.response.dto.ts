import { SellerStatus, StoreStatus, UserRole } from "../../constants/status.js";

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
