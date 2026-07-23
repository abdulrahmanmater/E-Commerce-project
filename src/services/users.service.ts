// users.service

import  { CreateUserDto }  from "../dtos/create-user.dto";
import createUserRepository from "../repositories/users.repository";
import { hashPassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";


const createUser = async (user: CreateUserDto)=>{
    const hash = await hashPassword(user.password);
    const newUser = await createUserRepository({
        ...user,
        password: hash
    })
    const token = generateAccessToken({id: newUser.id, role: newUser.role});
    return {
        message: "User created successfully",
        ...newUser,
        data:{
            accessToken: token
        }
    }
} 

export default createUser;