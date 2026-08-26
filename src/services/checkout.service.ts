//checkout.service.ts

import pool from "../config/db";

import { BadRequestError } from "../errors/bad-request-error";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";

import {
  createInventoryReservations,
  createOrder,
  createOrderItems,
  deleteCartItems,
  getAvailableStocks,
  lockCart,
  lockProducts,
} from "../repositories/checkout.repository";

import { findALllStoresByStoresId } from "../repositories/store.repository";

import { CheckoutDto } from "../dtos/checkout/checkout.dto";
import { createPayment } from "../repositories/payment.repository";
import { getAddressId } from "../repositories/address.repository";

export const checkout = async (
  userId: number,
  { addressId, method }: CheckoutDto,
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cart = await lockCart(client, userId);

    if (!cart) {
      throw new NotFoundError("The cart not found");
    }

    const address = await getAddressId(client, userId, addressId);

    if (!address) {
      throw new NotFoundError("The address not found");
    }

    const lockedProducts = await lockProducts(client, cart.id);

    if (lockedProducts.length === 0) {
      throw new NotFoundError("No products in cart");
    }

    const productIds = lockedProducts.map((product) => product.product_id);

    const availableStocks = await getAvailableStocks(client, productIds);
    const availableStockMap = new Map(
      availableStocks.map((stock) => [
        stock.product_id,
        Number(stock.available_stock),
      ]),
    );
    for (const product of lockedProducts) {
      if (product.is_hidden === true || product.deleted_at !== null) {
        throw new NotFoundError(
          `The product ${product.product_name} is removed from store`,
        );
      }
      const availableStock = availableStockMap.get(product.product_id);

      if (availableStock === undefined) {
        throw new NotFoundError(
          `Stock information not found for product ${product.product_name}`,
        );
      }

      if (availableStock < product.requested_quantity) {
        throw new BadRequestError(
          `The product ${product.product_name} has no enough available quantity`,
        );
      }
    }

    const storeIds = [
      ...new Set(lockedProducts.map((product) => product.store_id)),
    ];

    const stores = await findALllStoresByStoresId(client, storeIds);

    if (stores.length !== storeIds.length) {
      throw new ConflictError("One or more stores are not available");
    }

    for (const store of stores) {
      if (store.status !== "OPEN" || store.deleted_at !== null) {
        throw new ConflictError("One or more stores are out of service");
      }
    }

    const totalPrice = lockedProducts.reduce(
      (total, product) =>
        total + Number(product.product_price) * product.requested_quantity,
      0,
    );

    const orderItemsData = lockedProducts.map((product) => ({
      productId: product.product_id,
      quantity: product.requested_quantity,
      productPrice: Number(product.product_price),
    }));

    const cartItemsId = lockedProducts.map((product) => product.cart_item_id);

    const order = await createOrder(client, userId, addressId, totalPrice);

    const orderItems = await createOrderItems(client, order.id, orderItemsData);

    const orderItemsForInventory = orderItems.map((item) => ({
      orderItemId: item.id,
      quantity: item.quantity,
    }));

    await createInventoryReservations(client, orderItemsForInventory);

    await deleteCartItems(client, cartItemsId);

    const payment = await createPayment(client, order.id, totalPrice, method);

    await client.query("COMMIT");

    const returnedOrder = {
      orderID: order.id,
      userId: order.user_id,
      addressId: order.address_id,
      totalPrice: Number(order.total_price),
      createdAt: order.created_at,
    };

    const returnedOrderItems = orderItems.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      itemPrice: Number(item.item_price),
    }));

    const returnedPayment = {
      id: payment.id,
      orderId: payment.order_id,
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      createdAt: payment.created_at,
    };

    return {
      message: "Order created successfully",
      order: returnedOrder,
      orderItems: returnedOrderItems,
      payment: returnedPayment,
    };
  } catch (err) {
    await client.query("ROLLBACK");

    throw err;
  } finally {
    client.release();
  }
};
