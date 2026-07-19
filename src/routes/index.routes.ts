//index.routes.ts

import { Router } from "express";
const router = Router();

router.get("/", (req, res)=>{
    res.json({
  "message": "E-Commerce API is running"
    })
})

export default router;