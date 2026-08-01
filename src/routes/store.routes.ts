//store.router.ts

import { Router } from "express";
import { getStoreProducts } from "../controllers/store.controller";
const router = Router();

router.get("/:storeId/products", getStoreProducts);

export default router;
