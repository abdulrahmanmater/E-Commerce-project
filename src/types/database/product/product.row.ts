import { StoreStatus } from "../../shared/status.js";

export interface ProductByIdRow {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  store_id: number;
  updated_at: Date;
  created_at: Date;
  store_name: string;
  is_hidden: boolean;
  store_status: StoreStatus;
}

export interface CreatedProductRow {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface UpdatedProductRow {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductByStoreIdAndNameRow {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  store_id: number;
  is_hidden: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface DeletedProductRow {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
}
