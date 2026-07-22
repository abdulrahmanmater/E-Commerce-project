// validate.middleware.ts

import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
(schema: z.ZodTypeAny) =>
    (req: Request, res: Response, next: NextFunction) => {


    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
    });

    if (!result.success){
        return res.status(400).json({
            message: "Invalid request",
            error: result.error.issues,
        
        })
    }

    next();
}

