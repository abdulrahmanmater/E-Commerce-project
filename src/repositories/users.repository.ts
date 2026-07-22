// user.respository

import pool from "../config/db";
import  { CreateUserDto, UserResponseDto }  from "../dtos/create-user.dto";


const createUser = async (user:CreateUserDto)=>{
    const result = await pool.query <UserResponseDto> (`
        Insert into users (full_name, email, password_hash)
        values ($1, $2, $3)
        returning id,full_name, email, role
    `
    ,[user.fullname, user.email, user.password]);
    return result.rows[0];
}


export default createUser