// app.ts

import indexRoutes from "./routes/index.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import sellerRoutes from "./routes/sellers.routes";
import adminRoutes from "./routes/admin.routes";
import { globalErrorHandler } from "./middlewares/global-error-handler";
import express from "express";
const app = express();

app.use(express.json());

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/sellers", sellerRoutes);
app.use("/admin", adminRoutes);

app.use(globalErrorHandler);

export default app;
