//create.schema

import { z } from "zod";

export const createSellerSchema = z.object({
  nationalId: z
    .string()
    .trim()
    .min(14, "the national id should be 14")
    .max(14, "the national id should be 14"),
  nationalIdImage: z.string().trim(),
  bankAccountNumber: z
    .string()
    .trim()
    .min(5, "the bank account number should be higher than 5")
    .max(20, "the bank account number should be lower than 20"),
  bankName: z
    .string()
    .trim()
    .min(3, "The bank name should be higher than 3")
    .max(50, "The bank name should be lower than 50"),
});
