//update.dto.ts

import { z } from "zod";
import { updateUserSchema } from "../../schemas/users/update.schema";
import { updateUserPasswordSchema } from "../../schemas/users/update.user.password.schema";

export type UpdateUserDto = z.infer<typeof updateUserSchema>["body"];
export type UpdateUserPasswordDto = z.infer<
  typeof updateUserPasswordSchema
>["body"];
