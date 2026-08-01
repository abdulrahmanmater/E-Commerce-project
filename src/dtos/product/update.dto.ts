import { z } from "zod";
import { updateProductSchema } from "../../schemas/products/update.product.schema";

export type UpdateProductDto = z.infer<typeof updateProductSchema>["body"];
