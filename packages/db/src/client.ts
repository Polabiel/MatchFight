import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const client = postgres(process.env.POSTGRES_URL!, {
  // postgres.js maps ssl per URL params; local Docker has none
  prepare: false,
});

export const db = drizzle(client, {
  schema,
  casing: "snake_case",
});

export async function close() {
  await client.end();
}
