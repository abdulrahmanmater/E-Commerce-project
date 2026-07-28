//admin.routes.ts

import { Router } from "express";
const router = Router();
import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { UserRole } from "../dtos/user/user.response.dto";
import {
  getSellerApplications,
  getSellerApplicationByUserId,
  approveSellerApplication,
  rejectSellerApplication,
} from "../controllers/admin.controller";

router.get(
  "/seller-applications",
  auth,
  authorize(UserRole.ADMIN),
  getSellerApplications,
);
router.get(
  "/seller-applications/:id",
  auth,
  authorize(UserRole.ADMIN),
  getSellerApplicationByUserId,
);
router.patch(
  "/seller-applications/:id/approve",
  auth,
  authorize(UserRole.ADMIN),
  approveSellerApplication,
);
router.patch(
  "/seller-applications/:id/reject",
  auth,
  authorize(UserRole.ADMIN),
  rejectSellerApplication,
);

export default router;
