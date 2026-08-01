import { z } from "zod";
import { createProductSchema } from "../../schemas/products/create.product.schema";

export type CreateProductDto = z.infer<typeof createProductSchema>["body"];
