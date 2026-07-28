//admin.service.ts

import pool from "../config/db";
import { SellerStatus } from "../dtos/seller/response.dto";
import { StoreStatus } from "../dtos/store/response.dto";
import { UserRole } from "../dtos/user/user.response.dto";
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

export const getSellerApplications = async () => {
  const applications = await getSellerApplicationsRepository();
  if (!applications || applications.length === 0) {
    throw new NotFoundError("Application not found");
  }
  return applications;
};

export const getSellerApplicationsByUserId = async (id: number) => {
  const application = await getSellerApplicationByUserIdRepository(id);
  if (!application) {
    throw new NotFoundError("Application not found");
  }
  return application;
};

export const approveSellerApplication = async (id: number) => {
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

export const rejectSellerApplication = async (id: number) => {
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
