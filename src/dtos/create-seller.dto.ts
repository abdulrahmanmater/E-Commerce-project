// create-seller.dto

import { CreateSellerDto as CreateSellerProfileDto } from "../dtos/seller/create.dto";
import { CreateStoreDto } from "../dtos/store/create.dto";
import { UserResponseDto } from "./user/user.response.dto";

export interface CreateSellerDto {
  user: UserResponseDto;
  seller: CreateSellerProfileDto;
  store: CreateStoreDto;
}
