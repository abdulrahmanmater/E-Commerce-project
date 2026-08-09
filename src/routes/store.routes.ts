//store.router.ts

import { Router } from "express";
import { getStoreProducts } from "../controllers/store.controller";
import { validate } from "../middlewares/validate.middleware";
import { querySchema } from "../schemas/shared/query.schema";
const router = Router();

router.get("/:storeId/products", validate(querySchema), getStoreProducts);

export default router;
