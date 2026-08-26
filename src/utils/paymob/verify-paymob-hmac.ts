//verify-paymob-hmac.ts

import crypto from "crypto";

import { paymobConfig } from "../../config/paymob";
import { PaymobTransaction } from "../../dtos/paymop/paymop.dto";

export const verifyPaymobHmac = (
  transaction: PaymobTransaction,
  receivedHmac: string,
): boolean => {
  if (!/^[0-9a-f]{128}$/i.test(receivedHmac)) {
    return false;
  }

  const concatenated = [
    transaction.amount_cents,
    transaction.created_at,
    transaction.currency,
    transaction.error_occured,
    transaction.has_parent_transaction,
    transaction.id,
    transaction.integration_id,
    transaction.is_3d_secure,
    transaction.is_auth,
    transaction.is_capture,
    transaction.is_refunded,
    transaction.is_standalone_payment,
    transaction.is_voided,
    transaction.order.id,
    transaction.owner,
    transaction.pending,
    transaction.source_data.pan,
    transaction.source_data.sub_type,
    transaction.source_data.type,
    transaction.success,
  ].join("");

  const calculatedHmac = crypto
    .createHmac("sha512", paymobConfig.paymobHmac)
    .update(concatenated)
    .digest("hex");

  const calculatedBuffer = Buffer.from(calculatedHmac, "hex");

  const receivedBuffer = Buffer.from(receivedHmac, "hex");

  if (calculatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(calculatedBuffer, receivedBuffer);
};
