// users.controller
import { Request, Response } from "express";
export const createUser = (req: Request, res: Response)=>{
    const {fullname, email, password} = req.body;
    res.json({
        "message": "User created successfully",
        user:{
            fullname,
            email,
            password
        }
    })

}