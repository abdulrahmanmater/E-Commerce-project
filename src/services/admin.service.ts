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
import { SellerApplicationRow } from "../types/database/admin/admin.row.js";
import { UserRow } from "../types/database/user/user.row.js";
import {
  SellerProfileStatusRow,
  StoreStatusRow,
} from "../types/database/admin/admin.row.js";

export const getSellerApplications = async (): Promise<
  SellerApplicationRow[]
> => {
  const applications = await getSellerApplicationsRepository();
  if (!applications || applications.length === 0) {
    throw new NotFoundError("Application not found");
  }
  return applications;
};

export const getSellerApplicationsByUserId = async (
  id: number,
): Promise<SellerApplicationRow> => {
  const application = await getSellerApplicationByUserIdRepository(id);
  if (!application) {
    throw new NotFoundError("Application not found");
  }
  return application;
};

interface ApproveRejectResponse {
  message: string;
  user: UserRow | undefined;
  seller: SellerProfileStatusRow | undefined;
  store: StoreStatusRow | undefined;
}

export const approveSellerApplication = async (
  id: number,
): Promise<ApproveRejectResponse> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const application = await getSellerApplication(client, id);
    if (!application) {
      throw new NotFoundError("application not found");
    }
    if (application.status !== SellerStatus.PENDING) {
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
      user: updateRole,
      seller: sellerStatus,
      store: storeStatus,
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
): Promise<ApproveRejectResponse> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const application = await getSellerApplication(client, id);
    if (!application) {
      throw new NotFoundError("application not found");
    }
    if (application.status !== SellerStatus.PENDING) {
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
      user: user,
      seller: sellerStatus,
      store: storeStatus,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
