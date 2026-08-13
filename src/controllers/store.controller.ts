// store.controller.ts

import { Request, Response } from "express";
import { getStoreProducts as getStoreProductsService } from "../services/store.service";
import { ProductsQueryDto } from "../dtos/product/query.dto";

// get store products

export const getStoreProducts = async (req: Request, res: Response) => {
  const store_id = Number(req.params.storeId);
  const query = req.validated!.query as ProductsQueryDto;
  return res.json(await getStoreProductsService(store_id, query));
};
