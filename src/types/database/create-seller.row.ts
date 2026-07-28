//create-seller.row.ts

import { SellerRow } from "./seller/create.row";
import { StoreRow } from "./store/create.row";

export interface CreateSellerRow {
  seller: SellerRow;
  store: StoreRow;
}
