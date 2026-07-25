//canManageUser.middleware.ts

import { Request, Response, NextFunction } from "express";
import { UserRole } from "../dtos/create-user.dto";

export const canManageUser = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const userId = req.user.id;

    if (req.user.role !== UserRole.ADMIN && id !== userId.toString()) {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
}
