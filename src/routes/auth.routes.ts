// auth.routes.ts

import createUser from "../controllers/users.controller";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "../schemas/user.schema";
import authController from "../controllers/auth.controller";
import {Router} from "express";
const router = Router();

router.post("/login", authController)
router.post("/register", validate(createUserSchema), createUser)

export default router;