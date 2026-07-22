//create-user.dto.ts
import { z } from "zod";
import {createUserSchema} from "../schemas/user.schema";

export interface  UserResponseDto {
    id: number;
    full_name: string;
    email: string;
    role: UserRole;
}

export enum UserRole {
    CUSTOMER = "CUSTOMER",
    SELLER = "SELLER",
    ADMIN = "ADMIN",
}

export type CreateUserDto =
    z.infer<typeof createUserSchema>["body"];