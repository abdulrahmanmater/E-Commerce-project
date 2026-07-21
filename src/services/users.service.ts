// users.service

import  { CreateUserDto }  from "../dtos/create-user.dto";

import createUserRepository from "../repositories/users.repository";
const createUser = (user: CreateUserDto)=>{
    return createUserRepository(user)
} 

export default createUser;