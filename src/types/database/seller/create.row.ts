//seller.row

export interface SellerRow {
  national_id: string;
  national_id_image: string;
  bank_account_number: string;
  bank_name: string;
}

export interface SellerRowResponse {
  id: number;
  national_id: string;
  national_id_image: string;
  bank_account_number: string;
  bank_name: string;
  status: SellerStatus;
}
export enum SellerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
