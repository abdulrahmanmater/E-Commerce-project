//query.dto.ts

import { z } from "zod";
import { querySchema } from "../../schemas/shared/query.schema";

export type QueryDto = z.infer<typeof querySchema>["query"];
