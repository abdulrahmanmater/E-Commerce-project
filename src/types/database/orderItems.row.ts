//orderItems.row.ts

import { OrderItemStatus } from "../../constants/allowed-status.transactions";

export interface orderItemsAndProductsForPaymentRow {
  orderItemId: number;
  product_id: number;
  quantity: number;
  item_price: number;
  name: string;
  description: string;
}
export interface orderItemsRow {
  id: number;
  product_id: number;
  quantity: number;
  item_price: number;
  status: OrderItemStatus;
}
