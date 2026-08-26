import pool from "../config/db";
import { PoolClient } from "pg";
import { PaymentMethod } from "../constants/payment-status";
import { GetPaymentRow } from "../types/database/payment/payment.row";

// create payment

export const createPayment = async (
  client: PoolClient,
  orderId: number,
  amount: number,
  method: PaymentMethod,
) => {
  const result = await client.query(
    `
      INSERT INTO payments (
        order_id,
        amount,
        method
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        created_at;
    `,
    [orderId, amount, method],
  );

  return result.rows[0];
};

// lock payment

export const getPaymentForUpdate = async (
  client: PoolClient,
  paymentId: number,
) => {
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
      WHERE id = $1
      FOR UPDATE;
    `,
    [paymentId],
  );

  return result.rows[0];
};

// pay payment
// Used for COD: PENDING -> PAID

export const markPaymentAsPaid = async (
  client: PoolClient,
  paymentId: number,
) => {
  const result = await client.query(
    `
      UPDATE payments
      SET
        status = 'PAID',
        paid_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND status = 'PENDING'
      RETURNING
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        paid_at,
        created_at,
        updated_at;
    `,
    [paymentId],
  );

  return result.rows[0];
};

// process payment
// Used for CARD: PENDING -> PROCESSING

export const markPaymentAsProcessing = async (
  client: PoolClient,
  paymentId: number,
) => {
  const result = await client.query(
    `
      UPDATE payments
      SET
        status = 'PROCESSING',
        updated_at = NOW()
      WHERE id = $1
        AND status = 'PENDING'
      RETURNING
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        paid_at,
        created_at,
        updated_at;
    `,
    [paymentId],
  );

  return result.rows[0];
};

export const getPaymentCheckoutData = async (
  client: PoolClient,
  paymentId: number,
  userId: number,
) => {
  const result = await client.query(
    `
      SELECT
        p.id AS payment_id,
        p.amount AS payment_amount,
        p.currency AS payment_currency,
        p.method AS payment_method,
        p.status AS payment_status,
        p.provider_intention_id,

        o.id AS order_id,
        o.total_price,

        u.id AS user_id,
        u.full_name AS customer_full_name,
        u.email AS customer_email,

        a.id AS address_id,
        a.governorate,
        a.district,
        a.street,
        a.building_number,
        a.apartment,
        a.floor,
        a.phone_number,
        a.city,

        oi.id AS order_item_id,
        oi.product_id,
        oi.quantity,
        oi.item_price,

        pr.name AS product_name,
        pr.description AS product_description

      FROM payments p

      INNER JOIN orders o
        ON o.id = p.order_id

      INNER JOIN users u
        ON u.id = o.user_id

      INNER JOIN addresses a
        ON a.id = o.address_id

      INNER JOIN order_items oi
        ON oi.order_id = o.id

      INNER JOIN products pr
        ON pr.id = oi.product_id

      WHERE p.id = $1
        AND o.user_id = $2

      ORDER BY oi.id ASC

      FOR UPDATE OF p;
    `,
    [paymentId, userId],
  );

  return result.rows;
};

export const setPaymentProviderData = async (
  paymentId: number,
  providerIntentionId: string,
): Promise<boolean> => {
  const result = await pool.query(
    `
      UPDATE payments
      SET
        provider = 'PAYMOB',
        provider_intention_id = $2,
        updated_at = NOW()
      WHERE id = $1
        AND status = 'PROCESSING';
    `,
    [paymentId, providerIntentionId],
  );

  return result.rowCount === 1;
};

export const markPaymentAsExpired = async (
  client: PoolClient,
  paymentId: number,
) => {
  const result = await client.query(
    `
      UPDATE payments
      SET
        status = 'EXPIRED',
        updated_at = NOW()
      WHERE id = $1
        AND status IN ('PENDING', 'PROCESSING')
      RETURNING
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        created_at,
        updated_at;
    `,
    [paymentId],
  );

  return result.rows[0];
};

export const getPaymentForUpdateOwnedByUser = async (
  client: PoolClient,
  paymentId: number,
  userId: number,
) => {
  const result = await client.query<GetPaymentRow>(
    `
      SELECT
        p.id,
        p.order_id,
        p.amount,
        p.currency,
        p.method,
        p.status,
        p.provider,
        p.provider_intention_id,
        p.provider_transaction_id,
        p.paid_at,
        p.created_at,
        p.updated_at
      FROM payments p
      INNER JOIN orders o
        ON o.id = p.order_id
      WHERE p.id = $1
        AND o.user_id = $2
      FOR UPDATE;
    `,
    [paymentId, userId],
  );

  return result.rows[0];
};

export const getPaymentForUpdateByOrderId = async (
  client: PoolClient,
  orderId: number,
) => {
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
      WHERE order_id = $1
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE;
    `,
    [orderId],
  );

  return result.rows[0];
};

export const markPaymentAsCancelled = async (
  client: PoolClient,
  paymentId: number,
) => {
  const result = await client.query(
    `
      UPDATE payments
      SET
        status = 'CANCELLED',
        updated_at = NOW()
      WHERE id = $1
        AND status IN ('PENDING', 'PROCESSING')
      RETURNING
        id,
        order_id,
        amount,
        currency,
        method,
        status,
        created_at,
        updated_at;
    `,
    [paymentId],
  );

  return result.rows[0];
};

// Used when Paymob intention creation fails before a real payment attempt exists

export const resetPaymentToPending = async (
  client: PoolClient,
  paymentId: number,
) => {
  const result = await client.query<GetPaymentRow>(
    `
      UPDATE payments
      SET
        status = 'PENDING',
        provider_intention_id = NULL,
        provider_transaction_id = NULL,
        updated_at = NOW()
      WHERE id = $1
        AND status = 'PROCESSING'
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
