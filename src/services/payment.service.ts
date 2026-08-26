// payment.service.ts

import pool from "../config/db";
import { NotFoundError } from "../errors/not-found-error";
import { BadRequestError } from "../errors/bad-request-error";

import {
  getPaymentCheckoutData,
  getPaymentForUpdate,
  getPaymentForUpdateOwnedByUser,
  markPaymentAsExpired,
  markPaymentAsPaid,
  markPaymentAsProcessing,
  resetPaymentToPending,
  setPaymentProviderData,
} from "../repositories/payment.repository";
import {
  consumeInventoryReservationsByOrderId,
  expireInventoryReservationsByOrderId,
  isOrderReservationExpired,
} from "../repositories/inventoryReservation.repository";
import { createPaymentIntention } from "./paymob.service";
import { decreaseStock } from "../repositories/checkout.repository";
import { ConflictError } from "../errors/conflict-error";
import { areAllOrderItemsDelivered } from "../repositories/orderItems.repository";
import { InternalServerError } from "../errors/internal-server-error";

type CheckoutData = {
  paymentId: number;
  amount: number;
  currency: string;
  specialReference: string;
  customer: { fullName: string; email: string; phoneNumber: string };
  billingData: {
    fullName: string;
    email: string;
    governorate: string;
    district: string;
    street: string;
    buildingNumber: string;
    apartment: string;
    floor: string;
    phoneNumber: string;
    city: string;
  };
  items: {
    name: string;
    lineAmount: number;
    quantity: number;
    description: string;
  }[];
};

// start card payment

export const startCardPayment = async (paymentId: number, userId: number) => {
  let checkoutData: CheckoutData | undefined;
  let reservationExpired = false;

  // =========================================================
  // Phase 1: DB transaction
  // - Validate payment
  // - Validate reservation
  // - Build checkout data
  // - PENDING -> PROCESSING
  // =========================================================

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const rows = await getPaymentCheckoutData(client, paymentId, userId);

    if (rows.length === 0) {
      throw new NotFoundError("Payment not found");
    }

    const firstRow = rows[0];

    if (firstRow.payment_method !== "CARD") {
      throw new BadRequestError("This payment is not a card payment");
    }

    if (firstRow.payment_status !== "PENDING") {
      throw new BadRequestError(
        `Payment cannot be initialized from ${firstRow.payment_status} status`,
      );
    }

    // Check whether the order still has a valid reservation.
    const expired = await isOrderReservationExpired(client, firstRow.order_id);

    if (expired) {
      const updatedPayment = await markPaymentAsExpired(client, paymentId);

      if (!updatedPayment) {
        throw new ConflictError("Payment could not be expired");
      }

      await expireInventoryReservationsByOrderId(client, firstRow.order_id);

      reservationExpired = true;

      await client.query("COMMIT");
    } else {
      const paymentAmountCents = Math.round(
        Number(firstRow.payment_amount) * 100,
      );

      const orderTotalCents = Math.round(Number(firstRow.total_price) * 100);

      if (paymentAmountCents !== orderTotalCents) {
        throw new BadRequestError("Payment amount does not match order total");
      }

      const items = rows.map((row) => ({
        name: row.product_name,
        lineAmount: Number(row.item_price) * Number(row.quantity),
        quantity: Number(row.quantity),
        description: row.product_description ?? "Order item",
      }));

      const itemsTotalCents = items.reduce(
        (total, item) => total + Math.round(item.lineAmount * 100),
        0,
      );

      if (itemsTotalCents !== paymentAmountCents) {
        throw new BadRequestError(
          "Payment amount does not match order items total",
        );
      }

      checkoutData = {
        paymentId: firstRow.payment_id,

        amount: Number(firstRow.payment_amount),

        currency: firstRow.payment_currency,

        specialReference: `payment_${firstRow.payment_id}`,

        customer: {
          fullName: firstRow.customer_full_name,
          email: firstRow.customer_email,
          phoneNumber: firstRow.phone_number,
        },

        billingData: {
          fullName: firstRow.customer_full_name,
          email: firstRow.customer_email,
          governorate: firstRow.governorate,
          district: firstRow.district,
          street: firstRow.street,
          buildingNumber: firstRow.building_number,
          apartment: firstRow.apartment ?? "NA",
          floor: firstRow.floor ?? "NA",
          phoneNumber: firstRow.phone_number,
          city: firstRow.city,
        },

        items,
      };

      const processingPayment = await markPaymentAsProcessing(
        client,
        paymentId,
      );

      if (!processingPayment) {
        throw new ConflictError(
          "Payment is no longer available for processing",
        );
      }

      await client.query("COMMIT");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // =========================================================
  // Reservation expired
  // The transaction has already been committed.
  // =========================================================

  if (reservationExpired) {
    throw new ConflictError(
      "Payment reservation has expired. Please create a new order.",
    );
  }

  if (!checkoutData) {
    throw new InternalServerError("Checkout payment data was not prepared");
  }

  // =========================================================
  // Phase 2: External Paymob request
  // NO DB TRANSACTION HERE
  // =========================================================

  let paymentIntention;

  try {
    paymentIntention = await createPaymentIntention({
      amount: checkoutData.amount,
      currency: checkoutData.currency,
      specialReference: checkoutData.specialReference,
      customer: checkoutData.customer,
      billingData: checkoutData.billingData,
      items: checkoutData.items,
    });
  } catch (error) {
    const resetClient = await pool.connect();

    try {
      await resetClient.query("BEGIN");

      const resetPayment = await resetPaymentToPending(
        resetClient,
        checkoutData.paymentId,
      );

      if (!resetPayment) {
        throw new InternalServerError(
          "Payment could not be reset after Paymob intention failure",
        );
      }

      await resetClient.query("COMMIT");
    } catch (resetError) {
      await resetClient.query("ROLLBACK");

      console.error("Paymob intention failed and payment reset also failed", {
        paymentId: checkoutData.paymentId,
        originalError: error,
        resetError,
      });

      throw resetError;
    } finally {
      resetClient.release();
    }

    throw error;
  }

  // =========================================================
  // Persist Paymob intention
  // =========================================================

  const persisted = await setPaymentProviderData(
    checkoutData.paymentId,
    paymentIntention.intentionId,
  );

  if (!persisted) {
    console.error(
      "Paymob intention was created but local synchronization failed",
      {
        paymentId: checkoutData.paymentId,
        intentionId: paymentIntention.intentionId,
      },
    );

    const resetClient = await pool.connect();

    try {
      await resetClient.query("BEGIN");

      const resetPayment = await resetPaymentToPending(
        resetClient,
        checkoutData.paymentId,
      );

      if (!resetPayment) {
        throw new InternalServerError(
          "Payment could not be reset after provider synchronization failure",
        );
      }

      await resetClient.query("COMMIT");
    } catch (resetError) {
      await resetClient.query("ROLLBACK");

      console.error(
        "Payment reset failed after provider synchronization failure",
        {
          paymentId: checkoutData.paymentId,
          intentionId: paymentIntention.intentionId,
          resetError,
        },
      );

      throw resetError;
    } finally {
      resetClient.release();
    }

    throw new InternalServerError(
      "Payment intention was created but could not be synchronized locally",
    );
  }

  return {
    paymentId: checkoutData.paymentId,
    clientSecret: paymentIntention.clientSecret,
  };
};

export const confirmCodPayment = async (paymentId: number) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const payment = await getPaymentForUpdate(client, paymentId);

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.method !== "COD") {
      throw new BadRequestError(
        "Only COD payments can be confirmed manually. Card payments are confirmed by Paymob only.",
      );
    }

    if (payment.status !== "PENDING") {
      throw new BadRequestError(
        `Payment cannot be confirmed from ${payment.status} status`,
      );
    }

    const allDelivered = await areAllOrderItemsDelivered(
      client,
      payment.order_id,
    );

    if (!allDelivered) {
      throw new ConflictError(
        "All order items must be delivered before confirming COD payment",
      );
    }

    const updatedPayment = await markPaymentAsPaid(client, paymentId);

    if (!updatedPayment) {
      throw new ConflictError(
        "Payment status changed concurrently; please retry",
      );
    }

    const consumed = await consumeInventoryReservationsByOrderId(
      client,
      payment.order_id,
    );

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
      message: "COD payment confirmed successfully",
      payment: {
        id: updatedPayment.id,
        orderId: updatedPayment.order_id,
        amount: Number(updatedPayment.amount),
        currency: updatedPayment.currency,
        method: updatedPayment.method,
        status: updatedPayment.status,
        createdAt: updatedPayment.created_at,
        updatedAt: updatedPayment.updated_at,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getPaymentStatus = async (paymentId: number, userId: number) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const payment = await getPaymentForUpdateOwnedByUser(
      client,
      paymentId,
      userId,
    );

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.status === "PROCESSING") {
      const expired = await isOrderReservationExpired(client, payment.order_id);

      if (expired) {
        const updated = await markPaymentAsExpired(client, paymentId);

        if (!updated) {
          throw new ConflictError("Payment is no longer available");
        }
        await expireInventoryReservationsByOrderId(client, payment.order_id);

        await client.query("COMMIT");
        return { id: updated.id, status: updated.status };
      }
    }

    await client.query("COMMIT");
    return { id: payment.id, status: payment.status };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
