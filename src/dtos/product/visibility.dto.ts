// visibility.dto.ts
import { z } from "zod";
import { updateProductVisibilitySchema } from "../../schemas/products/visibility.schema";
export type UpdateProductVisibilityDto = z.infer<
  typeof updateProductVisibilitySchema
>["body"];
