// cart.service.ts

import {
  CartItemsResponseDto,
  AddCartItemDto,
  UpdateCartItemDto,
} from "../dtos/cart/cartItems.dto";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import {
  addCartItem as addCartItemRepository,
  addCart as addCartRepository,
  deleteCart as deleteCartRepository,
  deleteCartItem as deleteCartItemRepository,
  getCart,
  getCartItemsByCartIdAndProductId,
  getCartItems as getCartItemsRepository,
  sumTotal,
  updateCartItemQuantity,
  updateCartItem as updateCartItemRepository,
} from "../repositories/cart.repository";
import { getProductById } from "./product.service";

//get cart items

export const getCartItems = async (
  userId: number,
): Promise<CartItemsResponseDto> => {
  const cart = await getCart(userId);
  if (!cart) {
    return {
      cartId: null,
      items: [],
      total: 0,
    };
  }
  const cartItems = await getCartItemsRepository(cart.id);
  const total = await sumTotal(cart.id);
  const mappedCartItems = cartItems.map((cartItem) => {
    return {
      itemId: cartItem.item_id,
      products: {
        productId: cartItem.product_id,
        name: cartItem.product_name,
        price: cartItem.product_price,
      },
      quantity: cartItem.item_quantity,
      subTotal: cartItem.sub_total,
    };
  });
  return {
    cartId: cart.id,
    items: mappedCartItems,
    total,
  };
};

// add cart item

export const addCartItem = async (
  userId: number,
  { productId, quantity }: AddCartItemDto,
) => {
  const product = await getProductById(productId);
  if (!product) {
    throw new NotFoundError("The product not found");
  }
  if (product.quantity < quantity) {
    throw new BadRequestError("The required quantity is not available");
  }
  const cart = await getCart(userId);

  if (!cart) {
    const addedCart = await addCartRepository(userId);
    const cartItem = await addCartItemRepository(
      addedCart.id,
      productId,
      quantity,
    );
    return {
      message: "Cart item add successfully",
      cartItem,
    };
  }
  const cartItem = await getCartItemsByCartIdAndProductId(cart.id, productId);
  if (!cartItem) {
    const cartItem = await addCartItemRepository(cart.id, productId, quantity);
    return {
      message: "Cart item add successfully",
      cartItem,
    };
  }
  const newQuantity = cartItem.item_quantity + quantity;

  if (newQuantity > product.quantity) {
    throw new BadRequestError("The required quantity is not available");
  }
  const updatedCartItem = await updateCartItemQuantity(
    cartItem.item_id,
    newQuantity,
  );
  return {
    message: "Cart item quantity updated successfully",
    cartItem: updatedCartItem,
  };
};

//update cart item

export const updateCartItem = async (
  userId: number,
  productId: number,
  { quantity }: UpdateCartItemDto,
) => {
  const cart = await getCart(userId);
  if (!cart) {
    throw new NotFoundError("The cart not found");
  }
  const cartItem = await getCartItemsByCartIdAndProductId(cart.id, productId);
  if (!cartItem) {
    throw new NotFoundError("The cart item not found");
  }
  if (quantity > cartItem.product_quantity) {
    throw new BadRequestError("The required quantity is not available");
  }
  const updatedCartItem = await updateCartItemRepository(
    quantity,
    cartItem.item_id,
  );
  const returnedCartItem = {
    id: cartItem.item_id,
    quantity: updatedCartItem.item_quantity,
    productId: updatedCartItem.product_id,
  };
  return {
    message: "Cart item updated successfully",
    cartItem: returnedCartItem,
  };
};

// delete cart item

export const deleteCartItem = async (userId: number, productId: number) => {
  const cart = await getCart(userId);
  if (!cart) {
    throw new NotFoundError("The cart not found");
  }
  const cartItem = await getCartItemsByCartIdAndProductId(cart.id, productId);
  if (!cartItem) {
    throw new NotFoundError("The cart item not found");
  }
  await deleteCartItemRepository(cartItem.item_id);

  return {
    message: "Cart item deleted successfully",
  };
};

// delete cart

export const deleteCart = async (userId: number) => {
  const cart = await getCart(userId);
  if (!cart) {
    throw new NotFoundError("The cart not found");
  }
  await deleteCartRepository(cart.id);

  return {
    message: "Cart deleted successfully",
  };
};
