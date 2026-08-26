//paymob.routes.ts

import { Router } from "express";
import { paymobWebhook } from "../controllers/paymob-webhook.controller";

const router = Router();

router.post("/webhook", paymobWebhook);

export default router;
