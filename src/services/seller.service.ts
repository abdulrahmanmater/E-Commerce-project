// seller.service.ts

import pool from "../config/db";
import { CreateSellerDto } from "../dtos/create-seller.dto";
import { ResponseSellerDto } from "../dtos/seller/response.dto";
import { ResponseStoreDto, StoreStatus } from "../dtos/store/response.dto";
import { UserResponseDto } from "../dtos/user/user.response.dto";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";

import {
  lockUser,
  createSellerProfile,
  createStore,
  getSellerStatus,
  deleteSellerProfile,
} from "../repositories/seller.repository";

import { CreateSellerRow } from "../types/database/create-seller.row";
import { SellerStatus } from "../types/database/seller/create.row";

export const createSeller = async (userId: number, input: CreateSellerDto) => {
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

    const returnedUser: UserResponseDto = {
      id: user.id,
      email: user.email,
      fullname: user.full_name,
      role: user.role,
    };
    const returnedSeller: ResponseSellerDto = {
      id: seller.id,
      bankName: seller.bank_name,
      status: seller.status,
    };
    const returnedStore: ResponseStoreDto = {
      id: store.id,
      name: store.name,
      sellerId: store.seller_profile_id,
      status: store.status,
    };

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
