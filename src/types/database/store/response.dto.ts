// response.dto.ts

import { StoreStatus } from "../../shared/status";

export interface StoreProductsResponseDto {
  store: {
    storeId: number;
    storeName: string;
    storeStatus: StoreStatus;
  };
  products: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    description: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  pagination: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
