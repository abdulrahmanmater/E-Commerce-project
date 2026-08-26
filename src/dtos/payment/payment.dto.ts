//payment.dto.ts

export type CreatePaymentIntentionInput = {
  amount: number;
  currency: string;
  specialReference: string;

  customer: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };

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
    description?: string;
  }[];
};

export type CreatePaymentIntentionResult = {
  intentionId: string;
  clientSecret: string;
};
