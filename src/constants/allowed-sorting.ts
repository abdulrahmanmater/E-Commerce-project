// allowed-sorting.ts

export const productsAllowedSorting = {
  price: "p.price",
  name: "p.name",
  createdAt: "p.created_at",
  updatedAt: "p.updated_at",
} as const;

export const allowedSortOrders = {
  asc: "ASC",
  desc: "DESC",
} as const;

export const productsSortingValues = Object.keys(productsAllowedSorting) as [
  keyof typeof productsAllowedSorting,
  ...(keyof typeof productsAllowedSorting)[],
];
export const sortOrderValues = Object.keys(allowedSortOrders) as [
  keyof typeof allowedSortOrders,
  ...(keyof typeof allowedSortOrders)[],
];

export const ordersALlowedSorting = {
  totalPrice: "o.total_price",
  paymentStatus: "o.payment_status",
  createdAt: "o.created_at",
  paidAt: "o.paid_at",
} as const;

export const ordersSortingValues = Object.keys(ordersALlowedSorting) as [
  keyof typeof ordersALlowedSorting,
  ...(keyof typeof ordersALlowedSorting)[],
];

export const orderItemsALlowedSorting = {
  quantity: "oi.quantity",
  itemPrice: "oi.item_price",
  updatedAt: "oi.updated_at",
  status: "oi.status",
} as const;

export const orderItemsSortingValues = Object.keys(
  orderItemsALlowedSorting,
) as [
  keyof typeof orderItemsALlowedSorting,
  ...(keyof typeof orderItemsALlowedSorting)[],
];
