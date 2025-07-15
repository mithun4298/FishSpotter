import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// ES module fix for __dirname and ensure env is loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables explicitly
const envPath = path.join(__dirname, '..', '.env');
config({ path: envPath });

neonConfig.webSocketConstructor = ws;

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log('DB: DATABASE_URL loaded:', process.env.DATABASE_URL ? 'Yes' : 'No');
console.log('DB: Creating pool with connection string...');

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });