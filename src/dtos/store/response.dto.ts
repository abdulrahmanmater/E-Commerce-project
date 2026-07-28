//response.dto.ts

export interface ResponseStoreDto {
  id: number;
  name: string;
  sellerId: number;
  status: StoreStatus;
}

export enum StoreStatus {
  PENDING = "PENDING",
  OPEN = "OPEN",
  REJECTED = "REJECTED",
  HIDDEN = "HIDDEN",
}
