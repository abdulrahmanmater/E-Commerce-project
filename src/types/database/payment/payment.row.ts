//payment.row.ts

import {
  PaymentMethod,
  PaymentStatus,
} from "../../../constants/payment-status";
export const PAYMENT_PROVIDERS = {
  PAYMOB: "PAYMOB",
} as const;

export type PaymentProvider =
  (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

export interface GetPaymentRow {
  id: number;
  order_id: number;
  amount: string;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: PaymentProvider | null;
  provider_intention_id: string | null;
  provider_transaction_id: string | null;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
