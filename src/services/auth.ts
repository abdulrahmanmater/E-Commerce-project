//login.service.ts

import { LoginRequestDto } from "../dtos/auth/login.dto";
import { comparePassword } from "../utils/password";
import { findUserByEmail } from "../repositories/user.repository";
import { generateAccessToken } from "../utils/jwt";
import { AppError } from "../errors/app-error";
import { StatusCodes } from "../constants/status-codes";

export const login = async (user: LoginRequestDto) => {
  const existedUser = await findUserByEmail(user);
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
