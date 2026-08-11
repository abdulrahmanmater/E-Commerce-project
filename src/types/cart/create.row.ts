//create.row.ts

export interface CartItemsRow {
  item_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  item_quantity: number;
  sub_total: number;
}
export interface CartItemRow {
  item_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_quantity: number;
  item_quantity: number;
  sub_total: number;
}

export interface UpdateOrDeleteCartItemRow {
  cart_id: number;
  product_id: number;
  item_quantity: number;
}

export interface DeleteCartRow {
  id: number;
  user_id: number;
}

export interface AddCartItemsRow {
  cart_item_id: number;
  product_id: number;
  item_quantity: number;
}
