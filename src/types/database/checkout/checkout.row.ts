// checkout.row.ts

import { StoreStatus } from "../../../constants/status.js";

export interface LockedProductRow {
  product_id: number;
  store_id: number;
  product_name: string;
  product_price: string;
  available_quantity: number;
  deleted_at: Date | null;
  is_hidden: boolean;
  cart_item_id: number;
  cart_id: number;
  requested_quantity: number;
}

export interface AddressRowId {
  id: number;
}

export interface AddressRow {
  id: number;
  user_id: number;
  governorate: string;
  district: string;
  street: string;
  building_number: string;
  floor: string;
  apartment: string;
  phone_number: string;
  notes: string;
  is_default: boolean;
  city: string;
}

export interface CreatedOrderRow {
  id: number;
  user_id: number;
  address_id: number;
  status: string;
  total_price: string;
  created_at: Date;
}

export interface CreatedOrderItemRow {
  id: number;
  product_id: number;
  quantity: number;
  item_price: string;
}

export interface DecreasedStockRow {
  id: number;
  quantity: number;
}

export interface CheckoutStoreRow {
  id: number;
  status: StoreStatus;
  name: string;
  deleted_at: Date | null;
}
