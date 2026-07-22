//auth.controller.ts
import { Request, Response } from "express";
import { LoginRequestDto } from "../dtos/login.dto";
import loginService from "../services/login.service";


const login = async (req: Request, res: Response)=>{
    const user : LoginRequestDto = req.body;
    return res.json(await loginService(user))
}


export default login;