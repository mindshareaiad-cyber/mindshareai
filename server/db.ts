import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL environment variable is not set");
  console.error("Please set DATABASE_URL in your Render environment variables");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

export const db = drizzle(pool, { schema });
