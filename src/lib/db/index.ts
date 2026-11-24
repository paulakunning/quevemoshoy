import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";

let database: ReturnType<typeof drizzle> | undefined;

// Created on first use, not on import, so `next build` works without DATABASE_URL.
// The Neon HTTP driver sends each query as one request: no open connections
export function db() {
  database ??= drizzle(env("DATABASE_URL"));
  return database;
}
