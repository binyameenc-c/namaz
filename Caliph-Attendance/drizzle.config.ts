import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL && !process.env.EXTERNAL_DATABASE_URL) {
  throw new Error("DATABASE_URL or EXTERNAL_DATABASE_URL required, ensure the database is provisioned");
}

const dbUrl = process.env.DATABASE_URL || process.env.EXTERNAL_DATABASE_URL;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl!,
    ssl: { rejectUnauthorized: false },
  },
});
