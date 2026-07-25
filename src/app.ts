// app.ts

import indexRoutes from "./routes/index.routes";
import authRoutes from "./routes/auth.routes";
import { globalErrorHandler } from "./middlewares/global-error-handler";
import express from "express";
const app = express();

app.use(express.json());

app.use("/", indexRoutes);
app.use("/auth", authRoutes);

app.use(globalErrorHandler);

export default app;
