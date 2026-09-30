import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgresql://${encodeURIComponent(
      process.env.PGUSER!
    )}:${encodeURIComponent(process.env.PGPASSWORD!)}@${process.env.PGHOST}:${
      process.env.PGPORT
    }/${encodeURIComponent(process.env.PGDATABASE!)}`,
  },
});
