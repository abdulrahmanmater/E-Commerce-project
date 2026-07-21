// app.js

import indexRoutes from './routes/index.routes';
import usersRoutes from './routes/users.routes';
import express  from 'express';
const app = express();

app.use(express.json());

app.use('/',indexRoutes);
app.use('/users',usersRoutes);


export default app;
