// paymop.ts

import dotenv from "dotenv";
dotenv.config();

export const paymobConfig = {
  baseUrl: process.env.PAYMOB_BASE_URL!,
  secretKey: process.env.PAYMOB_SECRET_KEY!,
  publicKey: process.env.PAYMOB_PUBLIC_KEY!,
  paymobIframeId: process.env.PAYMOB_IFRAME_ID!,
  integrationId: Number(process.env.PAYMOB_INTEGRATION_ID),
  notificationUrl: process.env.PAYMOB_NOTIFICATION_URL!,
  redirectionUrl: process.env.PAYMOB_REDIRECTION_URL!,
  paymobHmac: process.env.PAYMOB_HMAC!,
};
