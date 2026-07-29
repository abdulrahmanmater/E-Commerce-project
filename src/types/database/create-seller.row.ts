//create-seller.row.ts

import { CreateSellerProfileData } from "./seller/create.row";
import { CreateStoreData } from "./store/create.row";

export interface CreateSellerRow {
  seller: CreateSellerProfileData;
  store: CreateStoreData;
}
