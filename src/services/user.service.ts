// user.service

import { NotFoundError } from "../errors/not-found-error";
import { CreateUserDto } from "../dtos/user/create.dto";
import { UserResponseDto } from "../dtos/user/user.response.dto";
import {
  createUser as createUserRepository,
  findUserByEmail,
  findUserById,
  deleteUser as deleteUserRepository,
  updateUser as updateUserRepository,
} from "../repositories/user.repository";
import { hashPassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import { UserRow } from "../types/database/user/user.row";
import { UpdateUserDto } from "../dtos/user/update.dto";
import { UpdateUserRow } from "../types/database/user/update-user.row";
import { ConflictError } from "../errors/conflict-error";

// createUser
export const createUser = async (user: CreateUserDto) => {
  const hash = await hashPassword(user.password);

  const newUser = await createUserRepository({
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
  const user = await findUserById(id);
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

//update user

export const updateUser = async (id: number, data: UpdateUserDto) => {
  const user = await findUserById(id);
  if (!user) {
    throw new NotFoundError();
  }
  if (data.email) {
    const existingUser = await findUserByEmail(data.email);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictError("Email already exists");
    }
  }
  const userRequest: UpdateUserRow = {};

  if (data.fullname !== undefined) {
    userRequest.full_name = data.fullname;
  }
  if (data.email !== undefined) {
    userRequest.email = data.email;
  }

  const updatedUser = await updateUserRepository(id, userRequest);
  if (!updatedUser) {
    throw new NotFoundError();
  }

  const userResponse: UserResponseDto = {
    id,
    email: updatedUser.email,
    fullname: updatedUser.full_name,
    role: updatedUser.role,
  };

  return {
    message: "Profile updated successfully",
    user: userResponse,
  };
};

// delete user

export const deleteUser = async (id: number) => {
  const user = await deleteUserRepository(id);
  if (!user) {
    throw new NotFoundError();
  }
  const userResponse: UserResponseDto = {
    id: user.id,
    fullname: user.full_name,
    email: user.email,
    role: user.role,
  };
  return {
    message: "Account deleted successfully",
    user: userResponse,
  };
};
