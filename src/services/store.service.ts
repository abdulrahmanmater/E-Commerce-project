// store.service.ts

import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import {
  getStore,
  getProductsByStoreId as getProductsByStoreIdRepository,
} from "../repositories/store.repository";
import { StoreStatus } from "../types/shared/status";

// get products by store id

export const getStoreProducts = async (store_id: number) => {
  const store = await getStore(store_id);

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

  const products = await getProductsByStoreIdRepository(store_id);

  if (products.length === 0) {
    return {
      message: "This store has no products",
      store: returnedStore,
      products,
    };
  }
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
  };
};
