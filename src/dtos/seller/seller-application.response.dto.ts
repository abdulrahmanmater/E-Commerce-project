import { SellerStatus, StoreStatus, UserRole } from "../../types/shared/status.js";

export interface SellerApplicationResponseDto {
  id: number;
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

export interface MySellerApplicationResponseDto {
  message: string;
  application: SellerApplicationResponseDto;
}
