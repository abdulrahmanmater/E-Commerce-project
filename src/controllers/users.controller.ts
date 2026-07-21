// users.controller


import  { CreateUserDto }  from "../dtos/create-user.dto";
import createUserService from "../services/users.service";
import { Request, Response } from "express";
const createUser = async  (req: Request, res: Response)=>{

    const user: CreateUserDto = req.body;
    res.json({
        "message": "User created successfully",
        user: await createUserService(user)
    })

}
export default createUser