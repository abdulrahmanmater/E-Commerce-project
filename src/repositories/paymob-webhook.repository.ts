import { PoolClient } from "pg";
import { GetPaymentRow } from "../types/database/payment/payment.row";

export const getPaymentForPaymobWebhook = async (
  client: PoolClient,
  providerIntentionId: string,
): Promise<GetPaymentRow | undefined> => {
  const result = await client.query<GetPaymentRow>(
    `
      SELECT
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        provider,
        provider_intention_id,
        provider_transaction_id,
        paid_at,
        created_at,
        updated_at
      FROM payments
      WHERE provider_intention_id = $1
        AND provider = 'PAYMOB'
      FOR UPDATE;
    `,
    [providerIntentionId],
  );

  return result.rows[0];
};
export const markPaymentAsPaidFromPaymob = async (
  client: PoolClient,
  paymentId: number,
  providerTransactionId: string,
) => {
  const result = await client.query<GetPaymentRow>(
    `
      UPDATE payments
      SET
        status = 'PAID',
        provider_transaction_id = $2,
        paid_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND status IN ('PROCESSING', 'PENDING')
        AND (
          provider_transaction_id IS NULL
          OR provider_transaction_id = $2
        )
      RETURNING
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        provider,
        provider_intention_id,
        provider_transaction_id,
        paid_at,
        created_at,
        updated_at;
    `,
    [paymentId, providerTransactionId],
  );

  return result.rows[0];
};

export const markPaymentAsPendingFromPaymob = async (
  client: PoolClient,
  paymentId: number,
) => {
  const result = await client.query(
    `
      UPDATE payments
      SET
        status = 'PENDING',
        provider_transaction_id = NULL,
        updated_at = NOW()
      WHERE id = $1
        AND status IN ('PROCESSING', 'PENDING')
      RETURNING
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        provider,
        provider_intention_id,
        provider_transaction_id,
        paid_at,
        created_at,
        updated_at;
    `,
    [paymentId],
  );

  return result.rows[0];
};
