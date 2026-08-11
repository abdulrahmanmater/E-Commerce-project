// user.service

import { NotFoundError } from "../errors/not-found-error";
import { CreateUserDto } from "../dtos/user/create.dto";
import {
  CreatedUserResponseDto,
  UserActionResponseDto,
  UserResponseDto,
} from "../dtos/user/user.response.dto";
import {
  createUser as createUserRepository,
  findUserByEmail,
  findUserById,
  deleteUser as deleteUserRepository,
  updateUser as updateUserRepository,
} from "../repositories/user.repository";
import { hashPassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";
import { UpdateUserDto } from "../dtos/user/update.dto";
import { UpdateUserData } from "../types/database/user/update-user.row";
import { ConflictError } from "../errors/conflict-error";

interface UserResponseSourceRow {
  id: number;
  full_name: string;
  email: string;
  role: UserResponseDto["role"];
}

const toUserResponseDto = (user: UserResponseSourceRow): UserResponseDto => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  role: user.role,
});

// createUser
export const createUser = async (
  user: CreateUserDto,
): Promise<CreatedUserResponseDto> => {
  const hash = await hashPassword(user.password);

  const newUser = await createUserRepository({
    ...user,
    password: hash,
  });

  const token = generateAccessToken({ id: newUser.id, role: newUser.role });

  return {
    message: "User created successfully",
    user: toUserResponseDto(newUser),
    tokens: {
      accessToken: token,
    },
  };
};

// getCurrentUser

export const getCurrentUser = async (
  id: number,
): Promise<UserActionResponseDto> => {
  const user = await findUserById(id);
  if (!user) {
    throw new NotFoundError();
  }
  return {
    message: "User found successfully",
    user: toUserResponseDto(user),
  };
};

//update user

export const updateUser = async (
  id: number,
  data: UpdateUserDto,
): Promise<UserActionResponseDto> => {
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
  const userRequest: UpdateUserData = {};

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

  return {
    message: "Profile updated successfully",
    user: toUserResponseDto(updatedUser),
  };
};

// delete user

export const deleteUser = async (
  id: number,
): Promise<UserActionResponseDto> => {
  const user = await deleteUserRepository(id);
  if (!user) {
    throw new NotFoundError();
  }
  return {
    message: "Account deleted successfully",
    user: toUserResponseDto(user),
  };
};
