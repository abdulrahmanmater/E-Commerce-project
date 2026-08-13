import { Router } from "express";

import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

import { checkout } from "../controllers/checkout.controller";

import { createCheckoutSchema } from "../schemas/checkout/create.checkout.schema";

const router = Router();

router.post("/", auth, validate(createCheckoutSchema), checkout);

export default router;
