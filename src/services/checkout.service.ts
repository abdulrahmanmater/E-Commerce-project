//checkout.service.ts

import pool from "../config/db";

import { BadRequestError } from "../errors/bad-request-error";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";

import {
  createOrder,
  createOrderItems,
  decreaseStock,
  deleteCartItems,
  getAddress,
  lockCart,
  lockProducts,
} from "../repositories/checkout.repository";

import { findALllStoresByStoresId } from "../repositories/store.repository";

import { CheckoutDto } from "../dtos/checkout/checkout.dto";

// =========================
// Checkout
// =========================

export const checkout = async (userId: number, { addressId }: CheckoutDto) => {
  const client = await pool.connect();

  try {
    // =====================================
    // BEGIN TRANSACTION
    // =====================================

    await client.query("BEGIN");

    // =====================================
    // 1. Lock user's cart
    // =====================================

    const cart = await lockCart(client, userId);

    if (!cart) {
      throw new NotFoundError("The cart not found");
    }

    // =====================================
    // 2. Verify address belongs to user
    // =====================================

    const address = await getAddress(client, userId, addressId);

    if (!address) {
      throw new NotFoundError("The address not found");
    }

    // =====================================
    // 3. Lock products
    // =====================================

    const lockedProducts = await lockProducts(client, cart.id);

    if (lockedProducts.length === 0) {
      throw new NotFoundError("No products in cart");
    }

    // =====================================
    // 4. Validate products
    // =====================================

    for (const product of lockedProducts) {
      if (product.is_hidden === true || product.deleted_at !== null) {
        throw new NotFoundError(
          `The product ${product.product_name} is removed from store`,
        );
      }

      if (product.available_quantity < product.requested_quantity) {
        throw new BadRequestError(
          `The product ${product.product_name} has no enough quantity`,
        );
      }
    }

    // =====================================
    // 5. Get unique stores
    // =====================================

    const storeIds = [
      ...new Set(lockedProducts.map((product) => product.store_id)),
    ];

    // =====================================
    // 6. Verify all stores still exist
    // =====================================

    const stores = await findALllStoresByStoresId(client, storeIds);

    if (stores.length !== storeIds.length) {
      throw new ConflictError("One or more stores are not available");
    }

    // =====================================
    // 7. Verify stores are active
    // =====================================

    for (const store of stores) {
      if (store.status !== "OPEN" || store.deleted_at !== null) {
        throw new ConflictError("One or more stores are out of service");
      }
    }

    // =====================================
    // 8. Calculate total
    // =====================================

    const totalPrice = lockedProducts.reduce(
      (total, product) =>
        total + Number(product.product_price) * product.requested_quantity,
      0,
    );

    // =====================================
    // 9. Prepare order items
    // =====================================

    const orderItemsData = lockedProducts.map((product) => ({
      productId: product.product_id,
      quantity: product.requested_quantity,
      productPrice: Number(product.product_price),
    }));

    // =====================================
    // 10. Prepare cart item IDs
    // =====================================

    const cartItemsId = lockedProducts.map((product) => product.cart_item_id);

    // =====================================
    // 11. Create order
    // =====================================

    const order = await createOrder(client, userId, addressId, totalPrice);

    // =====================================
    // 12. Create order items
    // =====================================

    const orderItems = await createOrderItems(client, order.id, orderItemsData);

    // =====================================
    // 13. Decrease stock
    // =====================================

    await decreaseStock(
      client,
      lockedProducts.map((product) => ({
        productId: product.product_id,
        quantity: product.requested_quantity,
      })),
    );

    // =====================================
    // 14. Delete cart items
    // =====================================

    await deleteCartItems(client, cartItemsId);

    // =====================================
    // 15. Commit
    // =====================================

    await client.query("COMMIT");

    // =====================================
    // Response
    // =====================================

    const returnedOrder = {
      orderID: order.id,
      userId: order.user_id,
      addressId: order.address_id,
      status: order.status,
      paymentStatus: order.payment_status,
      paidAt: order.paid_at,
      totalPrice: Number(order.total_price),
      createdAt: order.created_at,
    };

    const returnedOrderItems = orderItems.map((item) => ({
      id: item.id,
      productId: item.product_id,
      quantity: item.quantity,
      itemPrice: Number(item.item_price),
    }));

    return {
      message: "Order created successfully",

      order: returnedOrder,

      orderItems: returnedOrderItems,
    };
  } catch (err) {
    // =====================================
    // Rollback
    // =====================================

    await client.query("ROLLBACK");

    throw err;
  } finally {
    // =====================================
    // Release connection
    // =====================================

    client.release();
  }
};
