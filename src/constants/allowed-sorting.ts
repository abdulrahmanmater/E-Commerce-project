// allowed-sorting.ts

export const allowedSorting = {
  price: "p.price",
  name: "p.name",
  createdAt: "p.created_at",
  updatedAt: "p.updated_at",
} as const;

export const allowedSortOrders = {
  asc: "ASC",
  desc: "DESC",
} as const;

export const sortingValues = Object.keys(allowedSorting) as [
  keyof typeof allowedSorting,
  ...(keyof typeof allowedSorting)[],
];
export const sortOrderValues = Object.keys(allowedSortOrders) as [
  keyof typeof allowedSortOrders,
  ...(keyof typeof allowedSortOrders)[],
];
