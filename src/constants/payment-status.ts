//payment-status.ts

export const paymentMethods = ["COD", "CARD"] as const;

export type PaymentMethod = (typeof paymentMethods)[number];

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  PROCESSING: "PROCESSING",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const paymentStatusValues = Object.values(PAYMENT_STATUSES) as [
  PaymentStatus,
  ...PaymentStatus[],
];
