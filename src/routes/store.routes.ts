//store.router.ts

import { Router } from "express";
import { getStoreProducts } from "../controllers/store.controller";
import { auth } from "../middlewares/auth.middleware";
const router = Router();

router.get("/:storeId/products", getStoreProducts);

export default router;
