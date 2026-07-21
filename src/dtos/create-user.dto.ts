export interface CreateUserDto {
    fullname: string;
    email: string;
    password: string;
}
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