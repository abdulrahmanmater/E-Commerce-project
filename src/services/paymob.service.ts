import { paymobConfig } from "../config/paymob";
import { CreatePaymentIntentionInput } from "../dtos/payment/payment.dto";
import { ConflictError } from "../errors/conflict-error";
import { InternalServerError } from "../errors/internal-server-error";

const getNameParts = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);

  return {
    firstName: parts[0] || "Customer",
    lastName: parts.slice(1).join(" ") || parts[0] || "Customer",
  };
};

export const createPaymentIntention = async (
  input: CreatePaymentIntentionInput,
) => {
  const customerName = getNameParts(input.customer.fullName);
  const billingName = getNameParts(input.billingData.fullName);

  const itemsTotalCents = input.items.reduce(
    (total, item) => total + Math.round(item.lineAmount * 100),
    0,
  );

  const paymentAmountCents = Math.round(input.amount * 100);

  if (itemsTotalCents !== paymentAmountCents) {
    throw new ConflictError(
      "Payment amount does not match the total amount of payment items",
    );
  }

  const response = await fetch(`${paymobConfig.baseUrl}/v1/intention/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${paymobConfig.secretKey}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      amount: paymentAmountCents,

      currency: input.currency,

      payment_methods: [paymobConfig.integrationId],

      special_reference: input.specialReference,

      items: input.items.map((item) => ({
        name: item.name,
        amount: Math.round(item.lineAmount * 100),
        description: item.description ?? "Order item",
        quantity: item.quantity,
      })),

      billing_data: {
        first_name: billingName.firstName,
        last_name: billingName.lastName,

        email: input.billingData.email,
        phone_number: input.billingData.phoneNumber,

        apartment: input.billingData.apartment || "NA",
        floor: input.billingData.floor || "NA",
        street: input.billingData.street || "NA",
        building: input.billingData.buildingNumber || "NA",

        city: input.billingData.city || "NA",
        state: input.billingData.governorate || "NA",

        postal_code: "NA",
        shipping_method: "NA",
        country: "EG",
      },

      customer: {
        first_name: customerName.firstName,
        last_name: customerName.lastName,
        email: input.customer.email,
      },

      notification_url: paymobConfig.notificationUrl,
      redirection_url: paymobConfig.redirectionUrl,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new InternalServerError(
      `Paymob intention creation failed: ${errorBody}`,
    );
  }

  const data: {
    id: string;
    client_secret: string;
  } = await response.json();

  if (!data.id || !data.client_secret) {
    throw new InternalServerError(
      "Paymob returned an invalid intention response",
    );
  }

  return {
    intentionId: data.id,
    clientSecret: data.client_secret,
  };
};
