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
