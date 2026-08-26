import { Request, Response } from "express";
import {
  startCardPayment as startCardPaymentService,
  confirmCodPayment as confirmCodPaymentService,
} from "../services/payment.service";
import { getPaymentStatus as getPaymentStatusService } from "../services/payment.service";

export const startCardPayment = async (req: Request, res: Response) => {
  const paymentId = Number(req.params.paymentId);
  const userId = Number(req.user.id);

  res.status(200).json(await startCardPaymentService(paymentId, userId));
};

export const confirmCodPayment = async (req: Request, res: Response) => {
  const paymentId = Number(req.params.paymentId);

  res.status(200).json(await confirmCodPaymentService(paymentId));
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  const paymentId = Number(req.params.paymentId);
  const userId = Number(req.user.id);

  res.status(200).json(await getPaymentStatusService(paymentId, userId));
};
