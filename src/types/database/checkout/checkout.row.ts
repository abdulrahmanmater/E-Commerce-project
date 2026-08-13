// checkout.row.ts — Row types for checkout repository queries

import { StoreStatus } from "../../shared/status.js";

/**
 * Row from lockProducts() SELECT query.
 *
 * SQL aliases:
 *   p.id            → product_id
 *   p.name          → product_name
 *   p.price         → product_price       (numeric(10,2) → string)
 *   p.quantity       → available_quantity
 *   ci.id           → cart_item_id
 *   ci.quantity      → requested_quantity
 */
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

/** Row from getAddress() SELECT query */
export interface AddressRow {
  id: number;
}

/**
 * Row from createOrder() INSERT RETURNING * query.
 *
 * Matches the orders table:
 *   id, user_id, address_id, status, payment_status,
 *   paid_at, total_price, created_at
 *
 * total_price is numeric(10,2) → string from pg.
 */
export interface CreatedOrderRow {
  id: number;
  user_id: number;
  address_id: number;
  status: string;
  payment_status: string;
  paid_at: Date | null;
  total_price: string;
  created_at: Date;
}

/**
 * Row from createOrderItems() INSERT RETURNING query.
 *
 * RETURNING id, product_id, quantity, item_price
 *
 * item_price is numeric(10,2) → string from pg.
 */
export interface CreatedOrderItemRow {
  id: number;
  product_id: number;
  quantity: number;
  item_price: string;
}

/**
 * Row from decreaseStock() UPDATE RETURNING query.
 *
 * RETURNING id, quantity
 */
export interface DecreasedStockRow {
  id: number;
  quantity: number;
}

/**
 * Row from findALllStoresByStoresId() SELECT query.
 *
 * SELECT id, status, name, deleted_at FROM stores
 */
export interface CheckoutStoreRow {
  id: number;
  status: StoreStatus;
  name: string;
  deleted_at: Date | null;
}
