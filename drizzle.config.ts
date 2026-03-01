import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./src/lib/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://postgres:123@localhost:5432/gator?sslmode=disable",
  },
});