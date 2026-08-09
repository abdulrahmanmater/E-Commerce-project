//product.controller.ts

import { Request, Response } from "express";
import {
  getProductById as getProductByIdService,
  addProduct as addProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
  updateProductVisibility as updateProductVisibilityService,
  getProducts as getProductsService,
  getMyProducts as getMyProductsService,
} from "../services/product.service";
import { CreateProductDto } from "../dtos/product/create.dto";
import { UpdateProductDto } from "../dtos/product/update.dto";
import { QueryDto } from "../dtos/product/query.dto";

// get product by id

export const getProductById = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId);
  return res.json(await getProductByIdService(productId));
};

//add product

export const addProduct = async (req: Request, res: Response) => {
  return res.json(
    await addProductService(
      Number(req.user.id),
      req.validated!.body as CreateProductDto,
    ),
  );
};

// update product

export const updateProduct = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);
  const productId = Number(req.params.productId);
  const updatedProduct = req.validated!.body as UpdateProductDto;
  return res.json(
    await updateProductService(userId, productId, updatedProduct),
  );
};

//delete product

export const deleteProduct = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);
  const productId = Number(req.params.productId);
  return res.json(await deleteProductService(userId, productId));
};

// update product visibility

export const updateProductVisibility = async (req: Request, res: Response) => {
  const isHidden = req.validated!.body;
  const userId = Number(req.user.id);
  const productId = Number(req.params.productId);
  return res.json(
    await updateProductVisibilityService(userId, productId, isHidden),
  );
};

//get my products

export const getMyProducts = async (req: Request, res: Response) => {
  const query = req.validated!.query as QueryDto;
  const userId = Number(req.user.id);
  return res.json(await getMyProductsService(userId, query));
};

//get all products

export const getProducts = async (req: Request, res: Response) => {
  const query = req.validated!.query as QueryDto;
  console.log(query);
  return res.json(await getProductsService(query));
};
