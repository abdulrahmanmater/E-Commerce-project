// store.controller.ts

import { Request, Response } from "express";
import { getStoreProducts as getStoreProductsService } from "../services/store.service";

// get store products

export const getStoreProducts = async (req: Request, res: Response) => {
  const store_id = Number(req.params.storeId);
  return res.json(await getStoreProductsService(store_id));
};
