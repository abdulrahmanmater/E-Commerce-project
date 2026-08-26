import pool from "../config/db";
import { PaymobTransaction } from "../dtos/paymop/paymop.dto";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { UnauthorizedError } from "../errors/unauthorized-error";

import { consumeInventoryReservationsByOrderId } from "../repositories/inventoryReservation.repository";
import { decreaseStock } from "../repositories/checkout.repository";

import {
  getPaymentForPaymobWebhook,
  markPaymentAsPaidFromPaymob,
  markPaymentAsPendingFromPaymob,
} from "../repositories/paymob-webhook.repository";

import { paymobTransactionWebhookSchema } from "../schemas/paymob/paymob-webhook.schema";
import { verifyPaymobHmac } from "../utils/paymob/verify-paymob-hmac";

// =========================================================
// Paymob transaction helpers
// =========================================================

const isSuccessfulPaymobTransaction = (
  transaction: PaymobTransaction,
): boolean => {
  return (
    transaction.success === true &&
    transaction.pending === false &&
    transaction.error_occured === false &&
    transaction.is_voided === false &&
    transaction.is_refunded === false
  );
};

const isFailedPaymobTransaction = (transaction: PaymobTransaction): boolean => {
  return transaction.pending === false && transaction.success === false;
};

// =========================================================
// Handle Paymob transaction webhook
// =========================================================

export const handlePaymobTransaction = async (
  payload: unknown,
  hmac: string,
) => {
  // -------------------------------------------------------
  // 1. Validate webhook payload
  // -------------------------------------------------------

  const parsed = paymobTransactionWebhookSchema.safeParse(payload);

  if (!parsed.success) {
    throw new BadRequestError("Invalid Paymob webhook payload");
  }

  const webhook = parsed.data;

  // -------------------------------------------------------
  // 2. Verify HMAC before trusting the payload
  // -------------------------------------------------------

  if (!verifyPaymobHmac(webhook.obj, hmac)) {
    throw new UnauthorizedError("Invalid Paymob HMAC");
  }

  const transaction = webhook.obj;

  console.log("PAYMOB WEBHOOK TRANSACTION", {
    transactionId: transaction.id,
    intentionId: transaction.payment_key_claims.next_payment_intention,
    success: transaction.success,
    pending: transaction.pending,
    errorOccurred: transaction.error_occured,
  });

  // -------------------------------------------------------
  // 3. Get our payment reference
  // -------------------------------------------------------

  const intentionId = transaction.payment_key_claims.next_payment_intention;

  if (!intentionId) {
    throw new BadRequestError("Paymob payment intention ID is missing");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // -----------------------------------------------------
    // 4. Lock local payment
    // -----------------------------------------------------

    const payment = await getPaymentForPaymobWebhook(client, intentionId);

    if (!payment) {
      throw new NotFoundError(
        "Payment associated with Paymob transaction not found",
      );
    }

    // -----------------------------------------------------
    // 5. Validate amount
    // -----------------------------------------------------

    if (Math.round(Number(payment.amount) * 100) !== transaction.amount_cents) {
      throw new BadRequestError(
        "Paymob transaction amount does not match payment amount",
      );
    }

    // -----------------------------------------------------
    // 6. Validate currency
    // -----------------------------------------------------

    if (payment.currency !== transaction.currency) {
      throw new BadRequestError(
        "Paymob transaction currency does not match payment currency",
      );
    }

    // -----------------------------------------------------
    // 7. Closed payment handling
    // -----------------------------------------------------

    const CLOSED_STATUSES = ["PAID", "CANCELLED", "EXPIRED"] as const;

    if (
      CLOSED_STATUSES.includes(
        payment.status as (typeof CLOSED_STATUSES)[number],
      )
    ) {
      const isSameTransaction =
        payment.provider_transaction_id === String(transaction.id);

      // Duplicate webhook for an already processed payment.
      if (payment.status === "PAID" && isSameTransaction) {
        await client.query("COMMIT");

        return {
          processed: false,
          message: "Webhook already processed",
          paymentId: payment.id,
        };
      }

      // Paymob says success but our payment is already closed.
      if (isSuccessfulPaymobTransaction(transaction)) {
        console.error(
          "RECONCILIATION REQUIRED: Paymob reports success for an already-closed payment",
          {
            paymentId: payment.id,
            localStatus: payment.status,
            incomingTransactionId: transaction.id,
            amountCents: transaction.amount_cents,
          },
        );
      }

      await client.query("COMMIT");

      return {
        processed: false,
        message: `Payment already ${payment.status}; transaction was not applied`,
        paymentId: payment.id,
      };
    }

    // -----------------------------------------------------
    // 8. Only open payments can be finalized
    // -----------------------------------------------------

    if (payment.status !== "PROCESSING" && payment.status !== "PENDING") {
      await client.query("COMMIT");

      return {
        processed: false,
        status: payment.status,
        paymentId: payment.id,
      };
    }

    // -----------------------------------------------------
    // 9. Paymob says transaction is still pending
    // -----------------------------------------------------

    if (transaction.pending) {
      await client.query("COMMIT");

      return {
        processed: false,
        status: payment.status,
        paymentId: payment.id,
      };
    }

    // -----------------------------------------------------
    // 10. Successful payment
    // -----------------------------------------------------

    if (isSuccessfulPaymobTransaction(transaction)) {
      const updatedPayment = await markPaymentAsPaidFromPaymob(
        client,
        payment.id,
        String(transaction.id),
      );

      if (!updatedPayment) {
        throw new BadRequestError("Payment could not be marked as paid");
      }

      // ACTIVE reservation -> CONSUMED
      const consumed = await consumeInventoryReservationsByOrderId(
        client,
        payment.order_id,
      );

      // Physical stock is decreased only after successful payment.
      if (consumed.length > 0) {
        await decreaseStock(
          client,
          consumed.map((row) => ({
            productId: row.product_id,
            quantity: row.quantity,
          })),
        );
      }

      await client.query("COMMIT");

      return {
        processed: true,
        status: "PAID",
        paymentId: payment.id,
      };
    }

    // -----------------------------------------------------
    // 11. Failed Paymob attempt
    // -----------------------------------------------------
    //
    // IMPORTANT:
    // A failed Paymob transaction reopens the local payment as PENDING.
    // The same Paymob intention can receive another transaction
    // when the customer retries inside Paymob Checkout.
    // -----------------------------------------------------
    if (isFailedPaymobTransaction(transaction)) {
      const updatedPayment = await markPaymentAsPendingFromPaymob(
        client,
        payment.id,
      );

      if (!updatedPayment) {
        throw new BadRequestError("Payment could not be reset for retry");
      }

      await client.query("COMMIT");

      return {
        processed: true,
        status: "PENDING",
        paymentId: payment.id,
      };
    }
    // -----------------------------------------------------
    // 12. Unknown / unhandled transaction state
    // -----------------------------------------------------

    await client.query("COMMIT");

    return {
      processed: false,
      status: "PROCESSING",
      paymentId: payment.id,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
