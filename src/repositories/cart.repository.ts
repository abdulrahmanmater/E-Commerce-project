//cart.repository.ts

import pool from "../config/db";
import {
  AddCartItemsRow,
  CartItemRow,
  CartItemsRow,
  DeleteCartRow,
  UpdateOrDeleteCartItemRow,
} from "../types/cart/create.row";

//get cart

export const getCart = async (userId: number) => {
  const result = await pool.query<{ id: number }>(
    `
      select id  from carts 
      where user_id = $1;
    `,
    [userId],
  );
  return result.rows[0];
};

// add cart

export const addCart = async (userID: number) => {
  const result = await pool.query<{ id: number }>(
    `
      insert into carts (user_id) values ($1)
      ON CONFLICT (user_id) DO NOTHING
      returning id 
    `,
    [userID],
  );
  return result.rows[0];
};

//get cart items

export const getCartItems = async (cartId: number) => {
  const result = await pool.query<CartItemsRow>(
    `
    SELECT
        ci.id AS item_id,
        ci.quantity AS item_quantity,
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.price * ci.quantity AS sub_total
        from cart_items ci
        inner join products p on p.id = ci.product_id
        where ci.cart_id = $1;
        `,
    [cartId],
  );
  return result.rows;
};

//get cart items by cart id

export const getCartItemsByCartIdAndProductId = async (
  cartId: number,
  productId: number,
) => {
  const result = await pool.query<CartItemRow>(
    `
    select
        ci.id AS item_id,
        ci.quantity AS item_quantity,
        p.id AS product_id,
        p.name AS product_name,
        p.price AS product_price,
        p.quantity AS product_quantity,
        p.price * ci.quantity AS sub_total
        from cart_items ci
        inner join products p on p.id = ci.product_id
        where ci.cart_id = $1 and p.id = $2;
        `,
    [cartId, productId],
  );
  return result.rows[0];
};

// add cart item

export const addCartItem = async (
  cartId: number,
  productId: number,
  quantity: number,
) => {
  const result = await pool.query<AddCartItemsRow>(
    `
    insert into cart_items (cart_id, product_id, quantity)
    values ($1, $2, $3)
    returning id cart_items_id, product_id, quantity item_quantity;
    `,
    [cartId, productId, quantity],
  );
  return result.rows[0];
};

// total sum of cart

export const sumTotal = async (cartId: number) => {
  const result = await pool.query<{ total: number }>(
    `
        SELECT COALESCE(
          SUM(p.price * ci.quantity),
        0) AS total
        from cart_items ci
        inner join products p on p.id = ci.product_id
        where ci.cart_id = $1;
        `,
    [cartId],
  );
  return Number(result.rows[0].total);
};

//update cart item quantity

export const updateCartItemQuantity = async (
  cartItemId: number,
  newQuantity: number,
) => {
  const result = await pool.query<UpdateOrDeleteCartItemRow>(
    `
    update cart_items SET quantity = $1 ,
    updated_at = NOW()
    where id = $2
    returning quantity item_quantity, cart_id, product_id 
  `,
    [newQuantity, cartItemId],
  );
  return result.rows[0];
};

// update cart item

export const updateCartItem = async (quantity: number, cartItemId: number) => {
  const result = await pool.query<UpdateOrDeleteCartItemRow>(
    `
    update cart_items set quantity = $1,  updated_at = NOW()
    where id = $2 
    returning quantity item_quantity, cart_id, product_id 
  `,
    [quantity, cartItemId],
  );
  return result.rows[0];
};

//delete cart item

export const deleteCartItem = async (cartItemId: number) => {
  const result = await pool.query<UpdateOrDeleteCartItemRow>(
    `
    delete from cart_items where id = $1 
    returning quantity item_quantity, cart_id, product_id 
    `,
    [cartItemId],
  );
  return result.rows[0];
};

//delete cart

export const deleteCart = async (cartId: number) => {
  const result = await pool.query<DeleteCartRow>(
    `
    delete from carts where id = $1 
    returning id , user_id
    `,
    [cartId],
  );
  return result.rows[0];
};
