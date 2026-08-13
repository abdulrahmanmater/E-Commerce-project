//order.service.ts

import pool from "../config/db";

import {
  UpdateOrderItemStatusBodyDto,
  UpdateOrderItemStatusParamsDto,
  UpdateOrderItemStatusResponseDto,
} from "../dtos/order/update.dto";
import { updateOrderItemStatus as updateOrderItemStatusRepository } from "../repositories/order.repository";

import { OrdersParamsDto } from "../dtos/order/params.dto";
import { OrdersQueryDto } from "../dtos/order/query.dto";
import { NotFoundError } from "../errors/not-found-error";
import {
  getOrdersByUserId as getOrdersByUserIdRepository,
  getOrderByOrderIdAndUserId as getOrderByOrderIdAndUserIdRepository,
  getOrderItemsByOrderId as getOrderItemsByOrderIdRepository,
  countAllOrders,
  countAllOrderItems,
} from "../repositories/order.repository";
import { allowedStatusTransitions } from "../constants/allowed-status.transactions";
import { BadRequestError } from "../errors/bad-request-error";

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
      paymentStatus: order.payment_status,
      paidAt: order.paid_at,
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
  const returnedOrder = orderItems.map((item) => {
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
      paymentStatus: order.payment_status,
      paidAt: order.paid_at,
      totalPrice: Number(order.total_price),
      createdAt: order.created_at,
      items: returnedOrder,
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

  const updatedOrderItem = await updateOrderItemStatusRepository(
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
