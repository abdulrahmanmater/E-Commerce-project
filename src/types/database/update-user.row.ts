// update-user.row.dto.ts

import { UserRow } from "./user.row";

export type UpdateUserRow = Partial<Pick<UserRow, "full_name" | "email">>;
