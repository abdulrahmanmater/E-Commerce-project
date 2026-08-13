// seller.service.ts

import pool from "../config/db";
import {
  CreateSellerDto,
  ResponseCreateSellerDto,
} from "../dtos/create-seller.dto";
import { ResponseSellerDto } from "../dtos/seller/response.dto";
import { MySellerApplicationResponseDto } from "../dtos/seller/seller-application.response.dto";
import { ResponseStoreDto } from "../dtos/store/response.dto.js";
import { SellerStatus } from "../types/shared/status.js";
import { UserResponseDto } from "../dtos/user/user.response.dto";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";

import {
  lockUser,
  createSellerProfile,
  createStore,
  getSellerStatus,
  deleteSellerProfile,
  findSellerContextByUserId,
} from "../repositories/seller.repository";

import { CreateSellerRow } from "../types/database/create-seller.row";
import { CreatedSellerProfileRow } from "../types/database/seller/create.row.js";
import { SellerApplicationDetailsDto } from "../dtos/seller/seller-application.response.dto";
import { CreatedStoreRow } from "../types/database/store/create.row.js";
import { SellerApplicationResponseRow } from "../types/database/seller/seller-application.row";

const toUserResponseDto = (user: {
  id: number;
  full_name: string;
  email: string;
  role: UserResponseDto["role"];
}): UserResponseDto => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  role: user.role,
});

const toSellerApplicationResponseDto = (
  application: SellerApplicationResponseRow,
): SellerApplicationDetailsDto => ({
  userId: application.user_id,
  fullName: application.full_name,
  email: application.email,
  role: application.role,
  nationalId: application.national_id,
  nationalIdImage: application.national_id_image,
  bankName: application.bank_name,
  storeId: application.store_id,
  storeName: application.store_name,
  sellerStatus: application.seller_status,
  storeStatus: application.store_status,
});

const toSellerResponseDto = (
  seller: CreatedSellerProfileRow,
): ResponseSellerDto => ({
  id: seller.id,
  bankName: seller.bank_name,
  status: seller.status,
});

const toStoreResponseDto = (store: CreatedStoreRow): ResponseStoreDto => ({
  id: store.id,
  name: store.name,
  sellerId: store.seller_profile_id,
  status: store.status,
});

// create seller

export const createSeller = async (
  userId: number,
  input: CreateSellerDto,
): Promise<ResponseCreateSellerDto> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const user = await lockUser(client, userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role === "SELLER") {
      throw new ConflictError("User is already a seller");
    }
    const sellerStatus = await getSellerStatus(client, userId);

    switch (sellerStatus) {
      case SellerStatus.PENDING:
        throw new ConflictError(
          `you can't send another apply until your last apply reviewed by the admin`,
        );
      case SellerStatus.REJECTED:
        await deleteSellerProfile(client, userId);
        break;
      case SellerStatus.APPROVED:
        throw new ConflictError("User is already an approved seller");
    }

    const data: CreateSellerRow = {
      seller: {
        national_id: input.seller.nationalId,
        national_id_image: input.seller.nationalIdImage,
        bank_account_number: input.seller.bankAccountNumber,
        bank_name: input.seller.bankName,
      },
      store: {
        name: input.store.name,
      },
    };

    const seller = await createSellerProfile(client, userId, data);

    const store = await createStore(client, seller.id, data.store.name);

    const returnedUser = toUserResponseDto(user);
    const returnedSeller = toSellerResponseDto(seller);
    const returnedStore = toStoreResponseDto(store);

    await client.query("COMMIT");
    return {
      message:
        "Your application has been submitted successfully, and will be reviewed shortly.",
      user: returnedUser,
      seller: returnedSeller,
      store: returnedStore,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getMySellerApplication = async (
  id: number,
): Promise<MySellerApplicationResponseDto> => {
  const application = await findSellerContextByUserId(id);
  if (!application) {
    throw new NotFoundError("Application not found");
  }

  return {
    message: "Seller application retrieved successfully",
    application: toSellerApplicationResponseDto(application),
  };
};
