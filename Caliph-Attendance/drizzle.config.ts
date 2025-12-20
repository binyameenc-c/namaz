import { defineConfig } from "drizzle-kit";

// Render PostgreSQL Database Configuration
const RENDER_DATABASE_URL = "postgresql://caliph_namaz_user:iYCze0gVzEi79XzZNiSCQLG8IsKfBvQN@dpg-d50im4ngi27c73am89s0-a.singapore-postgres.render.com/caliph_namaz?sslmode=require";

const dbUrl = process.env.EXTERNAL_DATABASE_URL || process.env.DATABASE_URL || RENDER_DATABASE_URL;

if (!dbUrl) {
  throw new Error("Database URL not configured");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl!,
    ssl: { rejectUnauthorized: false },
  },
});
