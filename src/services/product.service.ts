//product.service

import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import {
  getProductById as getProductByIdRepository,
  addProduct as addProductRepository,
  updateProduct as updateProductRepository,
  deleteProduct as deleteProductRepository,
  updateProductVisibility as updateProductVisibilityRepository,
  findProductByStoreIdAndName,
} from "../repositories/product.repository";
import { findSellerContextByUserId } from "../repositories/seller.repository";
import { StoreStatus } from "../types/shared/status";
import { CreateProductDto } from "../dtos/product/create.dto";
import { UpdateProductDto } from "../dtos/product/update.dto";
import {
  ProductResponseDto,
  CreatedProductResponseDto,
  ProductDetailsResponseDto,
  ProductStoreResponseDto,
  UpdatedProductResponseDto,
  DeletedProductResponseDto,
} from "../dtos/product/response.dto";
import {
  ProductByIdRow,
  CreatedProductRow,
  UpdatedProductRow,
  DeletedProductRow,
} from "../types/database/product/product.row";
import { UpdateProductData } from "../types/database/product/product.row";
import { SellerApplicationDetailsRow } from "../types/database/seller/seller-application.row.js";

const toProductResponseDto = (product: ProductByIdRow): ProductResponseDto => ({
  storeName: product.store_name,
  id: product.id,
  name: product.name,
  price: product.price,
  quantity: product.quantity,
  description: product.description,
  updatedAt: product.updated_at,
  createdAt: product.created_at,
});

const toProductDetailsResponseDto = (
  product: CreatedProductRow | UpdatedProductRow | DeletedProductRow,
): ProductDetailsResponseDto => ({
  id: product.id,
  name: product.name,
  price: product.price,
  quantity: product.quantity,
  description: product.description,
});

const toProductStoreResponseDto = (
  sellerContext: SellerApplicationDetailsRow,
): ProductStoreResponseDto => ({
  id: sellerContext.store_id,
  name: sellerContext.store_name,
  status: sellerContext.store_status,
});

// get product by id

export const getProductById = async (
  productId: number,
): Promise<ProductResponseDto> => {
  const product = await getProductByIdRepository(productId);
  if (!product) {
    throw new NotFoundError("The product not found");
  }
  if (product.store_status !== "OPEN") {
    throw new ConflictError("The store is not open");
  }
  if (product.is_hidden) {
    throw new ConflictError("The product is hidden");
  }
  return toProductResponseDto(product);
};

//add product

export const addProduct = async (
  userId: number,
  product: CreateProductDto,
): Promise<CreatedProductResponseDto> => {
  const sellerContext = await findSellerContextByUserId(userId);
  if (!sellerContext) {
    throw new NotFoundError("Seller profile not found.");
  }

  if (sellerContext.store_status !== StoreStatus.OPEN) {
    throw new ConflictError("Your store is not open");
  }

  const addedProduct = await addProductRepository(
    sellerContext.store_id,
    product,
  );

  return {
    message: "Product created successfully",
    store: toProductStoreResponseDto(sellerContext),
    product: toProductDetailsResponseDto(addedProduct),
  };
};

// update product

export const updateProduct = async (
  userId: number,
  productId: number,
  data: UpdateProductDto,
): Promise<UpdatedProductResponseDto> => {
  const product = await getProductByIdRepository(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  const sellerContext = await findSellerContextByUserId(userId);
  if (!sellerContext) {
    throw new NotFoundError("Seller profile not found.");
  }
  if (product.store_id !== sellerContext.store_id) {
    throw new ConflictError("You are not allowed to update this product");
  }
  if (sellerContext.store_status !== StoreStatus.OPEN) {
    throw new ConflictError("Your store is not open");
  }
  if (data.name !== undefined) {
    const existingProduct = await findProductByStoreIdAndName(
      product.store_id,
      data.name,
    );
    if (existingProduct && existingProduct.id !== product.id) {
      throw new ConflictError("You already have a product with this name");
    }
  }

  const updateData: UpdateProductData = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.price !== undefined) {
    updateData.price = data.price;
  }
  if (data.quantity !== undefined) {
    updateData.quantity = data.quantity;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  const updatedProduct = await updateProductRepository(product.id, updateData);

  return {
    message: "Product updated successfully",
    product: toProductDetailsResponseDto(updatedProduct!),
  };
};

// delete product

export const deleteProduct = async (
  userId: number,
  productId: number,
): Promise<DeletedProductResponseDto> => {
  const product = await getProductByIdRepository(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  const sellerContext = await findSellerContextByUserId(userId);
  if (!sellerContext) {
    throw new NotFoundError("Seller profile not found.");
  }
  if (product.store_id !== sellerContext.store_id) {
    throw new ConflictError("You are not allowed to delete this product");
  }
  const deletedProduct = await deleteProductRepository(productId);

  return {
    message: "Product deleted successfully",
    product: toProductDetailsResponseDto(deletedProduct!),
  };
};

// update product visibility

export const updateProductVisibility = async (
  userId: number,
  productId: number,
  isHidden: any,
) => {
  const product = await getProductByIdRepository(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  const sellerContext = await findSellerContextByUserId(userId);
  if (!sellerContext) {
    throw new NotFoundError("Seller profile not found.");
  }
  if (product.store_id !== sellerContext.store_id) {
    throw new ConflictError("You are not allowed to update this product");
  }
  if (sellerContext.store_status !== StoreStatus.OPEN) {
    throw new ConflictError("Your store is not open");
  }
  const updatedProduct = await updateProductVisibilityRepository(
    productId,
    isHidden,
  );

  return {
    message: "Product visibility updated successfully",
    product: toProductDetailsResponseDto(updatedProduct!),
  };
};
