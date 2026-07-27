//create-user.dto.ts
import { z } from "zod";
import { createUserSchema } from "../../schemas/users/create.schema";

export type CreateUserDto = z.infer<typeof createUserSchema>["body"];
