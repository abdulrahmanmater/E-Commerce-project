// order.controller.ts

import { Request, Response } from "express";
import {
  getOrders as getOrdersService,
  getOrderByOrderId as getOrderByOrderIdService,
} from "../services/order.service";
import { OrdersQueryDto } from "../dtos/order/query.dto";
import { OrdersParamsDto } from "../dtos/order/params.dto";
import {
  UpdateOrderItemStatusBodyDto,
  UpdateOrderItemStatusParamsDto,
} from "../dtos/order/update.dto";

import { updateOrderItemStatus as updateOrderItemStatusService } from "../services/order.service";

// get orders

export const getOrders = async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(
      await getOrdersService(
        Number(req.user.id),
        req.validated!.query as OrdersQueryDto,
      ),
    );
};

//get order by orderId

export const getOrderByOrderId = async (req: Request, res: Response) => {
  return res.status(200).json(
    await getOrderByOrderIdService(
      Number(req.user.id),
      req.validated!.params as OrdersParamsDto, //orderId
      req.validated!.query as OrdersQueryDto,
    ),
  );
};

//update order item status

export const updateOrderItemStatus = async (req: Request, res: Response) => {
  const result = await updateOrderItemStatusService(
    Number(req.user.id),
    req.validated!.params as UpdateOrderItemStatusParamsDto,
    req.validated!.body as UpdateOrderItemStatusBodyDto,
  );

  return res.status(200).json(result);
};
