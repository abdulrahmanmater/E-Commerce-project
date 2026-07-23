// app.js

import indexRoutes from './routes/index.routes';
import authRoutes from './routes/auth.routes';
import express  from 'express';
const app = express();

app.use(express.json());

app.use('/',indexRoutes);
app.use("/auth", authRoutes)

export default app;
