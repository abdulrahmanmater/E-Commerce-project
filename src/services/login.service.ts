//login.service.ts

import { LoginRequestDto } from "../dtos/login.dto";
import { comparePassword } from "../utils/password";
import loginRepository from "../repositories/findUserByEmail";
import { generateAccessToken } from "../utils/jwt";


const login = async (user: LoginRequestDto)=>{
    const existedUser = await loginRepository(user);
    if (!existedUser){
        return {
            message: "the email or password is incorrect"
        }
    }
    const isPasswordCorrect = await comparePassword(user.password, existedUser.password_hash);
    if (!isPasswordCorrect){
        return {
            message: "the Password or email is incorrect"
        }
    }
    const token = generateAccessToken({id: existedUser.id, role: existedUser.role});
    const { password_hash, ...userWithoutPassword } = existedUser;
    return {
        message: "Login successful",
        user: userWithoutPassword,
        data:{
            accessToken: token
        }
    };
}

export default login;