//login.service.ts

import {
  LoginRequestDto,
  LoginResponseDto,
  LoginUserResponseDto,
} from "../dtos/auth/login.dto";
import { comparePassword } from "../utils/password";
import { findUserByEmail } from "../repositories/user.repository";
import { generateAccessToken } from "../utils/jwt";
import { AppError } from "../errors/app-error";
import { StatusCodes } from "../constants/status-codes";

const toLoginUserResponseDto = (user: {
  id: number;
  full_name: string;
  email: string;
  role: LoginUserResponseDto["role"];
}): LoginUserResponseDto => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role,
});

//login

export const login = async (
  user: LoginRequestDto,
): Promise<LoginResponseDto> => {
  const existedUser = await findUserByEmail(user.email);
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
  return {
    message: "Login successful",
    user: toLoginUserResponseDto(existedUser),
    tokens: {
      accessToken: token,
    },
  };
};
