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

export interface MyProductsResponseDto {
  products: {
    storeId: number;
    storeName: string;
    storeStatus: StoreStatus;
    id: number;
    name: string;
    price: number;
    quantity: number;
    description: string;
    isHidden: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
  pagination: {
    totalItems: number;
    totalPages: number;
  };
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
