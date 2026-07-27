//update.dto.ts

import { z } from "zod";
import { updateUserSchema } from "../../schemas/users/update.schema";

export type UpdateUserDto = z.infer<typeof updateUserSchema>["body"];
