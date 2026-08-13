//create.row.ts

export interface CartRow {
  id: number;
}

export interface CartItemRow {
  item_id: number;
  cart_id: number;
  product_id: number;
  product_name: string;
  product_price: string;
  product_quantity: number;
  item_quantity: number;
  sub_total: string;
}

export interface CartItemMutationRow {
  id: number;
  cart_id: number;
  product_id: number;
  item_quantity: number;
}

export interface CartTotalRow {
  total: string;
}

export interface DeletedCartItemRow {
  item_quantity: number;
  cart_id: number;
  product_id: number;
}

export interface DeletedCartRow {
  id: number;
  user_id: number;
}
