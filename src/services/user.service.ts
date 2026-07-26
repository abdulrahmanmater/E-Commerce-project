// user.service

import { NotFoundError } from "../errors/not-found-error";
import { CreateUserDto } from "../dtos/user/create-user.dto";
import { UserResponseDto } from "../dtos/user/user.response.dto";
import { createUser, findUserById } from "../repositories/user.repository";
import { hashPassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import { UserRow } from "../types/database/user.row";

// createUser
export const User = async (user: CreateUserDto) => {
  const hash = await hashPassword(user.password);
  // const modifiedUser = {
  //   ...user,
  //   fullname
  // }
  const newUser = await createUser({
    ...user,
    password: hash,
  });

  const token = generateAccessToken({ id: newUser.id, role: newUser.role });

  const userResponse: UserResponseDto = {
    id: newUser.id,
    email: newUser.email,
    fullname: newUser.full_name,
    role: newUser.role,
  };

  return {
    message: "User created successfully",
    user: userResponse,
    tokens: {
      accessToken: token,
    },
  };
};

// getCurrentUser

export const getCurrentUser = async (id: number) => {
  const user: UserRow = await findUserById(id);
  if (!user) {
    throw new NotFoundError();
  }
  const userResponse: UserResponseDto = {
    id: user.id,
    email: user.email,
    fullname: user.full_name,
    role: user.role,
  };

  return {
    message: "User found successfully",
    user: userResponse,
  };
};
