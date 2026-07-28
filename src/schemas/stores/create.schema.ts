//create.schema

import { z } from "zod";

export const createStoreSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "The store name should be higher than 3")
    .max(50, "The store name should be lower than 50"),
});
