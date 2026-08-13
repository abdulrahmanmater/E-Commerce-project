// store.service.ts

import { ProductsQueryDto } from "../dtos/product/query.dto";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import {
  getStore,
  getProductsByStoreId as getProductsByStoreIdRepository,
  countStoreProducts,
} from "../repositories/store.repository";
import { StoreProductsResponseDto } from "../dtos/store/response.dto";
import { StoreStatus } from "../types/shared/status";

// get products by store id

export const getStoreProducts = async (
  storeId: number,
  query: ProductsQueryDto,
): Promise<StoreProductsResponseDto> => {
  const store = await getStore(storeId);

  if (!store) {
    throw new NotFoundError("Store not found");
  }
  if (store.status !== StoreStatus.OPEN) {
    throw new ConflictError("Store is not open");
  }

  const returnedStore = {
    storeId: store.id,
    storeStatus: store.status,
    storeName: store.name,
  };

  const products = await getProductsByStoreIdRepository(storeId, query);

  const { totalItems } = await countStoreProducts(storeId, query);
  const totalPages = Math.ceil(totalItems / query.limit);
  const hasNextPage = query.page < totalPages;
  const hasPreviousPage = query.page > 1;
  const returnedPagination = {
    totalItems,
    totalPages,
    page: query.page,
    limit: query.limit,
    hasNextPage,
    hasPreviousPage,
  };

  const returnedProducts = products.map((product) => {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      description: product.description,
      updatedAt: product.updated_at,
      createdAt: product.created_at,
    };
  });
  return {
    store: returnedStore,
    products: returnedProducts,
    pagination: returnedPagination,
  };
};
