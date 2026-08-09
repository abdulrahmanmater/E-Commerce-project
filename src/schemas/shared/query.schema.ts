//query.schema.ts

import { z } from "zod";
import {
  sortOrderValues,
  sortingValues,
} from "../../constants/allowed-sorting";

export const querySchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1)
      .max(100)
      .default(10),
    page: z.coerce.number().int("Page must be an integer").min(1).default(1),
    category: z.string().trim().toLowerCase().optional(),
    sorting: z.enum(sortingValues).default("updatedAt"),
    sortOrder: z.enum(sortOrderValues).default("asc"),
    isHidden: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
    minPrice: z.coerce
      .number("Min price must be a number")
      .positive("Min price must be greater than 0")
      .optional(),
    maxPrice: z.coerce
      .number("Max price must be a number")
      .positive("Max price must be greater than 0")
      .optional(),
  }),
});
