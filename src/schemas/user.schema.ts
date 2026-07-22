//userSchema.ts

import { z } from "zod";

export const createUserSchema = z.object({
    body: z.object({
        fullname: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(100, "Name must be at most 100 characters"),

        email: z.
        string()
        .email("Invalid email")
        .trim()
        .toLowerCase(),

        password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be at most 128 characters")
    })
});
