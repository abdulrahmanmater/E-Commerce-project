// users.controller


import  { CreateUserDto }  from "../dtos/create-user.dto";
import createUserService from "../services/users.service";
import { Request, Response } from "express";
const createUser = async  (req: Request, res: Response)=>{

    const user: CreateUserDto = req.body;
    res.status(201).json(
        await createUserService(user)
    )

}
export default createUser