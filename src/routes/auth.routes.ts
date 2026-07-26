// auth.routes.ts

import { createUser } from "../controllers/user.controller";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "../schemas/user.schema";
import { login } from "../controllers/auth.controller";
import { Router } from "express";
const router = Router();

router.post("/login", login);
router.post("/register", validate(createUserSchema), createUser);

export default router;
