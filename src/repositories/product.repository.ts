// product.repository

import pool from "../config/db";
import {
  allowedSorting,
  allowedSortOrders,
} from "../constants/allowed-sorting";
import { CreateProductDto } from "../dtos/product/create.dto";
import { QueryDto } from "../dtos/product/query.dto";
import {
  ProductByIdRow,
  CreatedProductRow,
  UpdatedProductRow,
  ProductByStoreIdAndNameRow,
  DeletedProductRow,
  UpdateProductData,
  MyProductRow,
  MyProductRowWithoutStoreStatus,
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

// get my products

export const getMyProducts = async (userId: number, query: QueryDto) => {
  let queryStatement = `SELECT s.name store_name, s.status store_status, s.id store_id,
        p.id, p.name, p.price, p.quantity, p.description, p.is_hidden, p.updated_at, p.created_at
        FROM users u 
        INNER JOIN seller_profiles sp ON sp.user_id = u.id
        INNER JOIN stores s ON s.seller_profile_id = sp.id
        INNER JOIN products p ON p.store_id = s.id `;
  const {
    page,
    limit,
    category,
    isHidden,
    minPrice,
    maxPrice,
    sorting,
    sortOrder,
  } = query;
  const sortColumn = allowedSorting[sorting];
  const sortOrderColumn = allowedSortOrders[sortOrder];
  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [userId, limit, offset];
  if (category) {
    values.push(category);

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM product_categories pc
        INNER JOIN categories c
          ON c.id = pc.category_id
        WHERE pc.product_id = p.id
          AND c.name = $${values.length}
      )
    `);
  }
  if (isHidden !== undefined) {
    values.push(isHidden);
    conditions.push(`p.is_hidden = $${values.length}`);
  }
  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`p.price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";
  queryStatement += `WHERE u.id = $1
        AND p.deleted_at IS NULL ${whereClause}
        ORDER BY ${sortColumn} ${sortOrderColumn}, p.id ASC limit $2 offset $3;`;
  const result = await pool.query<MyProductRow>(queryStatement, [...values]);
  return result.rows;
};

// count my products

export const countMyProducts = async (userId: number, query: QueryDto) => {
  const { category, isHidden, minPrice, maxPrice } = query;
  let queryStatement = `select COUNT(DISTINCT p.id)         
    FROM users u 
        INNER JOIN seller_profiles sp ON sp.user_id = u.id
        INNER JOIN stores s ON s.seller_profile_id = sp.id
        INNER JOIN products p ON p.store_id = s.id `;
  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [userId];
  if (category) {
    values.push(category);

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM product_categories pc
        INNER JOIN categories c
          ON c.id = pc.category_id
        WHERE pc.product_id = p.id
          AND c.name = $${values.length}
      )
    `);
  }
  if (isHidden !== undefined) {
    values.push(isHidden);
    conditions.push(`p.is_hidden = $${values.length}`);
  }
  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`p.price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";
  queryStatement += ` WHERE u.id = $1 and p.deleted_at is null ${whereClause};`;
  const result = await pool.query<{ count: string }>(queryStatement, [
    ...values,
  ]);
  const totalItems = Number(result.rows[0].count);
  return { totalItems };
};

//count all products

export const countAllProducts = async (query: QueryDto) => {
  const { category, minPrice, maxPrice } = query;
  let queryStatement = `    select COUNT(DISTINCT p.id)         
    FROM 
      products p 
      INNER JOIN stores s ON p.store_id = s.id `;
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  if (category) {
    values.push(category);

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM product_categories pc
        INNER JOIN categories c
          ON c.id = pc.category_id
        WHERE pc.product_id = p.id
          AND c.name = $${values.length}
      )
    `);
  }
  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`p.price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";
  queryStatement += `where p.is_hidden = false and p.deleted_at is null 
        and s.status = 'OPEN' and s.deleted_at is null ${whereClause}`;
  const result = await pool.query<{ count: string }>(queryStatement, [
    ...values,
  ]);
  const totalItems = Number(result.rows[0].count);
  return { totalItems };
};

//get all products

export const getProducts = async (query: QueryDto) => {
  const { page, limit, category, minPrice, maxPrice, sorting, sortOrder } =
    query;
  let queryStatement = `select p.id, p.name, p.price, p.quantity, p.description, p.created_at, p.updated_at, 
        s.id store_id, s.name store_name
        from products p 
        inner join stores s 
        on s.id = p.store_id `;
  const sortColumn = allowedSorting[sorting];
  const sortOrderColumn = allowedSortOrders[sortOrder];

  const offset = (page - 1) * limit;
  const conditions: string[] = [];
  const values: (string | number | boolean)[] = [limit, offset];

  if (category) {
    values.push(category);

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM product_categories pc
        INNER JOIN categories c
          ON c.id = pc.category_id
        WHERE pc.product_id = p.id
          AND c.name = $${values.length}
      )
    `);
  }
  if (minPrice !== undefined) {
    values.push(minPrice);
    conditions.push(`p.price >= $${values.length}`);
  }
  if (maxPrice !== undefined) {
    values.push(maxPrice);
    conditions.push(`p.price <= $${values.length}`);
  }
  const whereClause =
    conditions.length > 0 ? `and ${conditions.join(" and ")}` : "";

  queryStatement += `
        where p.is_hidden = false and p.deleted_at is null 
        and s.status = 'OPEN' and s.deleted_at is null ${whereClause} 
        ORDER BY ${sortColumn} ${sortOrderColumn}, p.id ASC limit $1 offset $2;
    `;

  const result = await pool.query<MyProductRowWithoutStoreStatus>(
    queryStatement,
    [...values],
  );
  console.log(...values);
  console.log(whereClause);
  return result.rows;
};

//get categories

// export const getCategories = async () => {
//   const result = await pool.query(
//     `
//         select name from categories;
//     `,
//   );
//   return result.rows;
// };
