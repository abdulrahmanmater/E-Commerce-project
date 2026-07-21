//server

import pool from "./config/db";
import app from './app';
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("✅ Connected to PostgreSQL");

    app.listen(port, () => {
      console.log(` Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
}
startServer();