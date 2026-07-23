//index.routes.ts

import { Router } from "express";
const router = Router();
import {auth} from "../middlewares/auth.MDW";


router.get("/",auth, (req, res)=>{
    res.json({
  "message": "E-Commerce API is running"
    })
})

export default router;