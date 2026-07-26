// user.routes.ts

import { getCurrentUser } from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";
import { Router } from "express";
const router: Router = Router();

router.get("/me", auth, getCurrentUser);

export default router;
