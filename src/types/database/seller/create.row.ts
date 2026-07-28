//seller.row

import { SellerStatus } from "../../shared/status.js";

export interface SellerRow {
  national_id: string;
  national_id_image: string;
  bank_account_number: string;
  bank_name: string;
}

export interface SellerRowResponse {
  id: number;
  bank_name: string;
  status: SellerStatus;
}
