//cart.controller.ts

import { Request, Response } from "express";

import { AddCartItemDto, UpdateCartItemDto } from "../dtos/cart/cartItems.dto";

import {
  getCartItems as getCartItemsService,
  addCartItem as addCartItemService,
  updateCartItemQuantity as updateCartItemQuantityService,
  removeCartItem as removeCartItemService,
  removeCart as removeCartService,
} from "../services/cart.service";

export const getCartItems = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);

  const cart = await getCartItemsService(userId);

  res.json(cart);
};

export const addCartItem = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);

  const body = req.validated!.body as AddCartItemDto;

  const result = await addCartItemService(userId, body);

  res.status(201).json(result);
};

export const updateCartItem = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);

  const productId = Number(req.params.productId);

  const body = req.validated!.body as UpdateCartItemDto;

  const result = await updateCartItemQuantityService(userId, productId, body);

  res.json(result);
};

export const deleteCartItem = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);

  const productId = Number(req.params.productId);

  const result = await removeCartItemService(userId, productId);

  res.json(result);
};

export const deleteCart = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);

  const result = await removeCartService(userId);

  res.json(result);
};
