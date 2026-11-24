import { defineConfig } from "drizzle-kit";

// Local commands use .env.local (the dev branch). To migrate production, pass
// DATABASE_URL in the command: then the file is not read
if (!process.env.DATABASE_URL) process.loadEnvFile(".env.local");

// drizzle-kit exits without an error message when the URL is wrong
const url = process.env.DATABASE_URL ?? "";
if (!/^postgres(ql)?:\/\//.test(url)) {
  throw new Error("DATABASE_URL is not a postgresql:// connection string");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
