//index.routes.ts

import { Router } from "express";
const router = Router();
import { auth } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { UserRole } from "../constants/status.js";

router.get(
  "/",
  auth,
  authorize(UserRole.ADMIN, UserRole.SELLER),
  (req, res) => {
    res.json({
      message: "E-Commerce API is running",
    });
  },
);

export default router;
