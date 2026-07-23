//auth.MDW

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch(err) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }

}