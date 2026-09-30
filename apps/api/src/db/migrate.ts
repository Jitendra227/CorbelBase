import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { env } from "../config/env";

const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  database: env.PGDATABASE,
  user: env.PGUSER,
  password: env.PGPASSWORD,
});

const migrationsDir = path.resolve(process.cwd(), "drizzle");

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

    const appliedMigrations = await client.query<{ id: string }>(
      "SELECT id FROM schema_migrations"
    );
    const appliedMigrationIds = new Set(
      appliedMigrations.rows.map((row) => row.id)
    );

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      if (appliedMigrationIds.has(file)) {
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

      console.log("Applying migration...");

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (id) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");

        console.log("Applied migration");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
    console.log("Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
