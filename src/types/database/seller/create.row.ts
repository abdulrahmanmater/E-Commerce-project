//seller.row

import { SellerStatus } from "../../shared/status.js";

export interface CreateSellerProfileData {
  national_id: string;
  national_id_image: string;
  bank_account_number: string;
  bank_name: string;
}

export interface CreatedSellerProfileRow {
  id: number;
  bank_name: string;
  status: SellerStatus;
}
