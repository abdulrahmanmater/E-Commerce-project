//update.user.password.schema.ts

import { z } from "zod";

export const updateUserPasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters"),

      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters"),

      confirmationNewPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters"),
    })
    .refine((data) => data.newPassword === data.confirmationNewPassword, {
      path: ["confirmationNewPassword"],
      message: "Passwords do not match",
    }),
  params: z.object({}),
  query: z.object({}),
});
