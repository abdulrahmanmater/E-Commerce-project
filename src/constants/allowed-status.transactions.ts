// allowed-status.transactions.ts

export const OrderItemStatus = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderItemStatus = (typeof OrderItemStatus)[number];

export const allowedStatusTransitions: Record<
  OrderItemStatus,
  OrderItemStatus[]
> = {
  PENDING: [],
  CONFIRMED: ["PENDING"],
  PROCESSING: ["CONFIRMED"],
  SHIPPED: ["PROCESSING"],
  DELIVERED: ["SHIPPED"],
  CANCELLED: ["PENDING", "CONFIRMED", "PROCESSING"],
};
