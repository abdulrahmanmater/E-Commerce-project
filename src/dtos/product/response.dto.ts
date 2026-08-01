import { StoreStatus } from "../../types/shared/status.js";

export interface ProductResponseDto {
  storeName: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface ProductStoreResponseDto {
  id: number;
  name: string;
  status: StoreStatus;
}

export interface ProductDetailsResponseDto {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface CreatedProductResponseDto {
  message: string;
  store: ProductStoreResponseDto;
  product: ProductDetailsResponseDto;
}

export interface UpdatedProductResponseDto {
  message: string;
  product: ProductDetailsResponseDto;
}

export interface DeletedProductResponseDto {
  message: string;
  product: ProductDetailsResponseDto;
}
