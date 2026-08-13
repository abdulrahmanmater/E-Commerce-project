// app.ts

import indexRoutes from "./routes/index.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import productRoutes from "./routes/products.routes";
import sellerRoutes from "./routes/sellers.routes";
import adminRoutes from "./routes/admins.routes";
import checkoutRoutes from "./routes/checkouts.routes";
import storeRoutes from "./routes/stores.routes";
import orderRoutes from "./routes/orders.routes";
import cartRoutes from "./routes/carts.routes";
import { globalErrorHandler } from "./middlewares/global-error-handler";
import express from "express";
const app = express();

app.use(express.json());

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/sellers", sellerRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productRoutes);
app.use("/stores", storeRoutes);
app.use("/carts", cartRoutes);
app.use("/checkout", checkoutRoutes);
app.use("/orders", orderRoutes);

app.use(globalErrorHandler);

export default app;
