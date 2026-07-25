//login.service.ts

import { LoginRequestDto } from "../dtos/login.dto";
import { comparePassword } from "../utils/password";
import loginRepository from "../repositories/findUserByEmail";
import { generateAccessToken } from "../utils/jwt";
import { AppError } from "../errors/app-error";
import { StatusCodes } from "../constants/status-codes";

const login = async (user: LoginRequestDto) => {
  const existedUser = await loginRepository(user);
  if (!existedUser) {
    throw new AppError(
      "the Password or email is incorrect",
      StatusCodes.UNAUTHORIZED,
    );
  }
  const isPasswordCorrect = await comparePassword(
    user.password,
    existedUser.password_hash,
  );
  if (!isPasswordCorrect) {
    throw new AppError(
      "the Password or email is incorrect",
      StatusCodes.UNAUTHORIZED,
    );
  }
  const token = generateAccessToken({
    id: existedUser.id,
    role: existedUser.role,
  });
  const { password_hash, ...userWithoutPassword } = existedUser;
  return {
    message: "Login successful",
    user: userWithoutPassword,
    tokens: {
      accessToken: token,
    },
  };
};

export default login;
