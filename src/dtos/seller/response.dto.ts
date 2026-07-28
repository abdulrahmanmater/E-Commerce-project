// response.dto.ts

export interface ResponseSellerDto {
  id: number;
  bankName: string;
  status: SellerStatus;
}

export enum SellerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
