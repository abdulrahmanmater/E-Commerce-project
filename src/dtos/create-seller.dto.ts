// create-seller.dto

import { CreateSellerDto as CreateSellerProfileDto } from "../dtos/seller/create.dto";
import { CreateStoreDto } from "../dtos/store/create.dto";
import { UserResponseDto } from "./user/user.response.dto";
import { ResponseSellerDto } from "./seller/response.dto";
import { ResponseStoreDto } from "./store/response.dto";

export interface CreateSellerDto {
  seller: CreateSellerProfileDto;
  store: CreateStoreDto;
}

// create-seller.dto

export interface ResponseCreateSellerDto {
  message: string;
  user: UserResponseDto;
  seller: ResponseSellerDto;
  store: ResponseStoreDto;
}
