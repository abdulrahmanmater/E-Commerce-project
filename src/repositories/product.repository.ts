// product.repository

import pool from "../config/db";
import { CreateProductDto } from "../dtos/product/create.dto";
import {
  ProductByIdRow,
  CreatedProductRow,
  UpdatedProductRow,
  ProductByStoreIdAndNameRow,
  DeletedProductRow,
  UpdateProductData,
} from "../types/database/product/product.row";

// get product by id

export const getProductById = async (productId: number) => {
  const result = await pool.query<ProductByIdRow>(
    `
      select p.id, p.name, p.price, p.quantity, p.description, p.store_id, p.is_hidden, p.updated_at, p.created_at, s.name store_name, p.is_hidden, s.status store_status
      from products p inner join stores s on s.id = p.store_id 
      where p.id = $1
      AND p.deleted_at IS NULL 
    `,
    [productId],
  );
  return result.rows[0];
};

//add product

export const addProduct = async (
  store_id: number,
  product: CreateProductDto,
) => {
  const result = await pool.query<CreatedProductRow>(
    `
            insert into products (store_id, name, price, quantity, description)
            values ($1, $2, $3, $4, $5)
            returning id, name, price, quantity, description, is_hidden, created_at, updated_at;
        `,
    [
      store_id,
      product.name,
      product.price,
      product.quantity,
      product.description,
    ],
  );
  return result.rows[0];
};

// update product

export const updateProduct = async (
  productId: number,
  data: UpdateProductData,
) => {
  const updates: string[] = [];
  const values: (string | number)[] = [];
  const fields = [
    { column: "name", value: data.name },
    { column: "price", value: data.price },
    { column: "quantity", value: data.quantity },
    { column: "description", value: data.description },
  ];

  for (const field of fields) {
    if (field.value !== undefined) {
      updates.push(`${field.column} = $${values.length + 1}`);
      values.push(field.value);
    }
  }
  updates.push("updated_at = NOW()");
  values.push(productId);
  const result = await pool.query<UpdatedProductRow>(
    `
        UPDATE products
        SET ${updates.join(", ")}
        WHERE id = $${values.length} AND deleted_at IS NULL 
        returning id, name, price, quantity, description, is_hidden, created_at, updated_at;
    `,
    values,
  );

  return result.rows[0];
};

//find product by name and store id

export const findProductByStoreIdAndName = async (
  store_id: number,
  name: string,
) => {
  const result = await pool.query<ProductByStoreIdAndNameRow>(
    `
        select * from products where store_id = $1 and name = $2 AND deleted_at IS NULL;
    `,
    [store_id, name],
  );
  return result.rows[0];
};

//delete product

export const deleteProduct = async (productId: number) => {
  const result = await pool.query<DeletedProductRow>(
    `
      UPDATE products
      SET deleted_at = NOW(),
      updated_at = NOW()
      WHERE id = $1
      AND deleted_at IS NULL 
      returning id, name, price, quantity, description, is_hidden
    `,
    [productId],
  );
  return result.rows[0];
};

// update product visibility

export const updateProductVisibility = async (
  productId: number,
  isHidden: { isHidden: boolean },
) => {
  const result = await pool.query(
    `
        UPDATE products
        SET is_hidden = $2,
        updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL 
        returning id, name, price, quantity, description, is_hidden, created_at, updated_at;
    `,
    [productId, isHidden.isHidden],
  );
  return result.rows[0];
};
