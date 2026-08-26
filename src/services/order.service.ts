//order.service.ts

import pool from "../config/db";

import {
  UpdateOrderItemStatusBodyDto,
  UpdateOrderItemStatusParamsDto,
  UpdateOrderItemStatusResponseDto,
} from "../dtos/order/update.dto";
import {
  updateOrderItemStatusByOrderItemIdAndSellerId as updateOrderItemStatusByOrderItemIdAndSellerIdRepository,
  getOrderItemsByOrderId as getOrderItemsByOrderIdRepository,
  countAllOrderItems,
  cancelOrderItemsByOrderId,
  hasDeliveredItems,
} from "../repositories/orderItems.repository";

import { OrdersParamsDto } from "../dtos/order/params.dto";
import { OrdersQueryDto } from "../dtos/order/query.dto";
import { NotFoundError } from "../errors/not-found-error";
import {
  getOrdersByUserId as getOrdersByUserIdRepository,
  countAllOrders,
  getOrderByOrderIdAndUserId as getOrderByOrderIdAndUserIdRepository,
  cancelOrderRow,
  getOrderForUpdateOwnedByUser,
} from "../repositories/order.repository";
import { allowedStatusTransitions } from "../constants/allowed-status.transactions";
import { BadRequestError } from "../errors/bad-request-error";
import { ConflictError } from "../errors/conflict-error";
import { releaseInventoryReservationsByOrderId } from "../repositories/inventoryReservation.repository";
import {
  getPaymentForUpdateByOrderId,
  markPaymentAsCancelled,
} from "../repositories/payment.repository";

// get orders

export const getOrders = async (userId: number, query: OrdersQueryDto) => {
  const orders = await getOrdersByUserIdRepository(userId, query);
  const { totalItems } = await countAllOrders(userId, query);
  const totalPages = Math.ceil(totalItems / query.limit);
  const hasNextPage = query.page < totalPages;
  const hasPreviousPage = query.page > 1;
  const returnedPagination = {
    totalItems: totalItems,
    totalPages: totalPages,
    page: query.page,
    limit: query.limit,
    hasNextPage,
    hasPreviousPage,
  };
  if (orders.length === 0) {
    return {
      message: "No orders found",
      orders: [],
      pagination: returnedPagination,
    };
  }
  const returnedOrders = orders.map((order) => {
    return {
      orderId: order.id,
      userId: order.user_id,
      addressId: order.address_id,
      status: order.status,
      totalPrice: Number(order.total_price),
      createdAt: order.created_at,
    };
  });
  return {
    message: "Orders found successfully",
    orders: returnedOrders,
    pagination: returnedPagination,
  };
};

// get order by order id

export const getOrderByOrderId = async (
  userId: number,
  orderId: OrdersParamsDto,
  query: OrdersQueryDto,
) => {
  const order = await getOrderByOrderIdAndUserIdRepository(orderId, userId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }
  const orderItems = await getOrderItemsByOrderIdRepository(orderId, query);

  const { totalItems } = await countAllOrderItems(orderId, query);
  const totalPages = Math.ceil(totalItems / query.limit);
  const hasNextPage = query.page < totalPages;
  const hasPreviousPage = query.page > 1;
  const returnedPagination = {
    totalItems: totalItems,
    totalPages: totalPages,
    page: query.page,
    limit: query.limit,
    hasNextPage,
    hasPreviousPage,
  };
  const returnedOrderItems = orderItems.map((item) => {
    return {
      orderItems: {
        itemId: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        status: item.status,
        itemPrice: Number(item.item_price),
      },
    };
  });
  return {
    message: "Order found successfully",
    order: {
      orderId: order.id,
      userId: order.user_id,
      addressId: order.address_id,
      totalPrice: Number(order.total_price),
      status: order.status,
      createdAt: order.created_at,
      items: returnedOrderItems,
    },
    pagination: returnedPagination,
  };
};

//update order items status

export const updateOrderItemStatus = async (
  sellerUserId: number,
  { orderItemId }: UpdateOrderItemStatusParamsDto,
  { status }: UpdateOrderItemStatusBodyDto,
): Promise<UpdateOrderItemStatusResponseDto> => {
  const allowedCurrentStatuses = allowedStatusTransitions[status];
  if (allowedCurrentStatuses === undefined) {
    throw new BadRequestError("Invalid order item status");
  }

  const updatedOrderItem =
    await updateOrderItemStatusByOrderItemIdAndSellerIdRepository(
      orderItemId,
      sellerUserId,
      status,
      allowedCurrentStatuses,
    );

  if (!updatedOrderItem) {
    throw new NotFoundError(
      "Order item not found or status transition is not allowed",
    );
  }

  return {
    message: "Order item status updated successfully",

    orderItem: {
      id: updatedOrderItem.id,
      productId: updatedOrderItem.product_id,
      status: updatedOrderItem.status,
    },
  };
};

export const cancelOrder = async (orderId: number, userId: number) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const order = await getOrderForUpdateOwnedByUser(client, orderId, userId);
    if (!order) throw new NotFoundError("Order not found");
    if (order.status === "CANCELLED")
      throw new BadRequestError("Order is already cancelled");

    if (await hasDeliveredItems(client, orderId)) {
      throw new ConflictError(
        "Order has delivered items and cannot be cancelled directly",
      );
    }

    const payment = await getPaymentForUpdateByOrderId(client, orderId);

    if (payment && payment.status === "PAID") {
      throw new ConflictError(
        "A paid order cannot be cancelled directly; issue a refund instead",
      );
    }

    await cancelOrderRow(client, orderId);
    await cancelOrderItemsByOrderId(client, orderId);

    if (
      payment &&
      (payment.status === "PENDING" || payment.status === "PROCESSING")
    ) {
      await markPaymentAsCancelled(client, payment.id);
    }

    await releaseInventoryReservationsByOrderId(client, orderId);

    await client.query("COMMIT");

    return { message: "Order cancelled successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
