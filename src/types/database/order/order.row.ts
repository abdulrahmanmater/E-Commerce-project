// order.row.ts

import { OrderStatus } from "../../../constants/status";

export interface GetOrder {
  id: number;
  user_id: number;
  address_id: number;
  total_price: string;
  status: OrderStatus;
  created_at: Date;
}
