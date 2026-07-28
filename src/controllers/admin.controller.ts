//admin.controller.ts

import { Request, Response } from "express";
import {
  getSellerApplications as getSellerApplicationsService,
  getSellerApplicationsByUserId as getSellerApplicationsByUserIdService,
  approveSellerApplication as approveSellerApplicationService,
  rejectSellerApplication as rejectSellerApplicationService,
} from "../services/admin.service";

export const getSellerApplications = async (req: Request, res: Response) => {
  return res.status(200).json(await getSellerApplicationsService());
};

export const getSellerApplicationByUserId = async (
  req: Request,
  res: Response,
) => {
  const id = Number(req.params.id);
  return res.status(200).json(await getSellerApplicationsByUserIdService(id));
};

export const approveSellerApplication = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  return res.status(200).json(await approveSellerApplicationService(id));
};

export const rejectSellerApplication = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  return res.status(200).json(await rejectSellerApplicationService(id));
};
