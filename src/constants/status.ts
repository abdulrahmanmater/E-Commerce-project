// status.ts — Single source of truth for all status/role enums

export enum SellerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum StoreStatus {
  PENDING = "PENDING",
  OPEN = "OPEN",
  REJECTED = "REJECTED",
  HIDDEN = "HIDDEN",
}

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  SELLER = "SELLER",
  ADMIN = "ADMIN",
}

export enum StatusCodes {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export enum OrderStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
}
