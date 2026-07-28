// auth.routes.ts

import { createUser } from "../controllers/user.controller";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "../schemas/users/create.schema";
import { login } from "../controllers/auth.controller";
import { Router } from "express";
import { loginUserSchema } from "../schemas/users/login.schema";
const router = Router();

router.post("/login", validate(loginUserSchema), login);
router.post("/register", validate(createUserSchema), createUser);

export default router;
