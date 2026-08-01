//visibility.schema.ts

import { z } from "zod";
import { productIdParamsSchema } from "../shared/params.schema";

export const updateProductVisibilitySchema = z.object({
  body: z.object({
    isHidden: z.boolean(),
  }),

  params: productIdParamsSchema,

  query: z.object({}),
});
