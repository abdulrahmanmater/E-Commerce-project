// checkout.dto.ts

import { z } from "zod";
import { createCheckoutSchema } from "../../schemas/checkout/create.checkout.schema";
export type CheckoutDto = z.infer<typeof createCheckoutSchema>["body"];
