// user.routes.ts

import {
  getCurrentUser,
  deleteUser,
  updateUser,
} from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserSchema } from "../schemas/users/update.schema";
import { Router } from "express";
const router: Router = Router();

router.get("/me", auth, getCurrentUser);
router.delete("/me", auth, deleteUser);
router.patch("/me", auth, validate(updateUserSchema), updateUser);

export default router;
