import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../schema';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const connectionString = process.env.TEST_POSTGRES_URL;
if (!connectionString) {
  throw new Error('TEST_POSTGRES_URL is not defined');
}

export const connection = postgres(connectionString, { max: 1 });
export const db = drizzle(connection, { schema });

export async function runMigrations() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const migrationsFolder = join(__dirname, '../../drizzle');
  await migrate(db, { migrationsFolder });
}