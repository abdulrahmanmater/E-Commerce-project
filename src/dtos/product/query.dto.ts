//query.dto.ts

import { z } from "zod";
import { productsQuerySchema } from "../../schemas/shared/query.schema";

export type ProductsQueryDto = z.infer<typeof productsQuerySchema>["query"];
