//admin.service.ts

import pool from "../config/db";
import { SellerStatus, StoreStatus, UserRole } from "../types/shared/status.js";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";
import {
  getSellerApplications as getSellerApplicationsRepository,
  getSellerApplicationByUserId as getSellerApplicationByUserIdRepository,
  changeSellerProfileStatus,
  changeStoreStatus,
  getSellerApplication,
} from "../repositories/admin.repository";
import { findUser, updateUserRole } from "../repositories/user.repository";
import {
  AdminSellerApplicationResponseDto,
  AdminSellerStatusResponseDto,
  AdminStoreStatusResponseDto,
  AdminUserResponseDto,
  ApproveRejectSellerApplicationResponseDto,
} from "../dtos/admin/seller-application.response.dto";

interface AdminSellerApplicationSource {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  national_id: string;
  national_id_image: string;
  bank_name: string;
  store_name: string;
  seller_status: SellerStatus;
  store_status: StoreStatus;
}

const toAdminSellerApplicationResponseDto = (
  application: AdminSellerApplicationSource,
): AdminSellerApplicationResponseDto => ({
  id: application.user_id,
  full_name: application.full_name,
  email: application.email,
  role: application.role,
  national_id: application.national_id,
  national_id_image: application.national_id_image,
  bank_name: application.bank_name,
  store_name: application.store_name,
  status: application.seller_status,
  store_status: application.store_status,
});

const toAdminUserResponseDto = (
  user:
    | {
        id: number;
        full_name: string;
        email: string;
        role: UserRole;
      }
    | undefined,
): AdminUserResponseDto | undefined =>
  user && {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };

const toAdminSellerStatusResponseDto = (
  seller:
    | {
        id: number;
        bank_name: string;
        status: SellerStatus;
      }
    | undefined,
): AdminSellerStatusResponseDto | undefined =>
  seller && {
    id: seller.id,
    bank_name: seller.bank_name,
    status: seller.status,
  };

const toAdminStoreStatusResponseDto = (
  store:
    | {
        id: number;
        name: string;
        status: StoreStatus;
      }
    | undefined,
): AdminStoreStatusResponseDto | undefined =>
  store && {
    id: store.id,
    name: store.name,
    status: store.status,
  };

export const getSellerApplications = async (): Promise<
  AdminSellerApplicationResponseDto[]
> => {
  const applications = await getSellerApplicationsRepository();
  if (!applications) {
    throw new NotFoundError("Application not found");
  }
  return applications.map(toAdminSellerApplicationResponseDto);
};

export const getSellerApplicationsByUserId = async (
  id: number,
): Promise<AdminSellerApplicationResponseDto> => {
  const application = await getSellerApplicationByUserIdRepository(id);
  if (!application) {
    throw new NotFoundError("Application not found");
  }
  return toAdminSellerApplicationResponseDto(application);
};

export const approveSellerApplication = async (
  id: number,
): Promise<ApproveRejectSellerApplicationResponseDto> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const application = await getSellerApplication(client, id);
    if (!application) {
      throw new NotFoundError("application not found");
    }
    if (application.seller_status !== SellerStatus.PENDING) {
      throw new ConflictError("Application has already been reviewed");
    }
    const sellerProfileId = application.seller_profile_id;

    const sellerStatus = await changeSellerProfileStatus(
      client,
      sellerProfileId,
      SellerStatus.APPROVED,
    );
    if (!sellerStatus) {
      throw new NotFoundError("seller profile not found");
    }
    const storeStatus = await changeStoreStatus(
      client,
      sellerProfileId,
      StoreStatus.OPEN,
    );
    if (!storeStatus) {
      throw new NotFoundError("store not found");
    }
    const updateRole = await updateUserRole(
      client,
      application.user_id,
      UserRole.SELLER,
    );
    if (!updateRole) {
      throw new NotFoundError("user not found");
    }

    await client.query("COMMIT");
    return {
      message: "The application has been approved successfully.",
      user: toAdminUserResponseDto(updateRole),
      seller: toAdminSellerStatusResponseDto(sellerStatus),
      store: toAdminStoreStatusResponseDto(storeStatus),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const rejectSellerApplication = async (
  id: number,
): Promise<ApproveRejectSellerApplicationResponseDto> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const application = await getSellerApplication(client, id);
    if (!application) {
      throw new NotFoundError("application not found");
    }
    if (application.seller_status !== SellerStatus.PENDING) {
      throw new ConflictError("Application has already been reviewed");
    }

    const sellerProfileId = application.seller_profile_id;
    const sellerStatus = await changeSellerProfileStatus(
      client,
      sellerProfileId,
      SellerStatus.REJECTED,
    );
    if (!sellerStatus) {
      throw new NotFoundError("seller profile not found");
    }
    const storeStatus = await changeStoreStatus(
      client,
      sellerProfileId,
      StoreStatus.REJECTED,
    );
    if (!storeStatus) {
      throw new NotFoundError("store not found");
    }
    const user = await findUser(client, application.user_id);

    await client.query("COMMIT");
    return {
      message: "The application has been rejected successfully.",
      user: toAdminUserResponseDto(user),
      seller: toAdminSellerStatusResponseDto(sellerStatus),
      store: toAdminStoreStatusResponseDto(storeStatus),
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
