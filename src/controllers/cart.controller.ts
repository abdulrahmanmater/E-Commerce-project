//cart.controller.ts

import { Request, Response } from "express";
import {
  getCartItems as getCartItemsService,
  addCartItem as addCartItemService,
  updateCartItem as updateCartItemService,
  deleteCartItem as deleteCartItemService,
  deleteCart as deleteCartService,
} from "../services/cart.service";
import { AddCartItemDto, UpdateCartItemDto } from "../dtos/cart/cartItems.dto";
//get cart items

export const getCartItems = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);
  res.json(await getCartItemsService(userId));
};

//add cart item

export const addCartItem = async (req: Request, res: Response) => {
  const userId = Number(req.user.id);
  res
    .status(201)
    .json(
      await addCartItemService(userId, req.validated!.body as AddCartItemDto),
    );
};

// update cart item

export const updateCartItem = async (req: Request, res: Response) => {
  res.json(
    await updateCartItemService(
      Number(req.user.id),
      Number(req.params.productId),
      req.validated!.body as UpdateCartItemDto,
    ),
  );
};

// delete cart item

export const deleteCartItem = async (req: Request, res: Response) => {
  res.json(
    await deleteCartItemService(
      Number(req.user.id),
      Number(req.params.productId),
    ),
  );
};
// delete cart

export const deleteCart = async (req: Request, res: Response) => {
  res.json(await deleteCartService(Number(req.user.id)));
};
