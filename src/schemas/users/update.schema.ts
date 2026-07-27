// update.schema

import { createUserSchema } from "../../schemas/users/create.schema";
import { z } from "zod";

export const updateUserSchema = z.object({
  body: createUserSchema.shape.body
    .pick({
      fullname: true,
      email: true,
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    }),
  params: z.object({}),
  query: z.object({}),
});
