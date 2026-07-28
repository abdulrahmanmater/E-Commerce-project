//create-seller.schema.ts

import { z } from "zod";
import { createStoreSchema } from "../schemas/stores/create.schema";
import { createSellerSchema as createSellerProfileSchema } from "../schemas/sellers/create.schema";

export const createSellerSchema = z.object({
  body: z.object({
    seller: createSellerProfileSchema,
    store: createStoreSchema,
  }),
  params: z.object({}),
  query: z.object({}),
});
