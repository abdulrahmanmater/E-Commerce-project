// users.service

import  { CreateUserDto }  from "../dtos/create-user.dto";
import createUserRepository from "../repositories/users.repository";
import { hashPassword } from "../utils/password";


const createUser = async (user: CreateUserDto)=>{
    const hash = await hashPassword(user.password);
    const newUser = {
        ...user,
        password: hash,
    }
    return createUserRepository(newUser)
} 

export default createUser;