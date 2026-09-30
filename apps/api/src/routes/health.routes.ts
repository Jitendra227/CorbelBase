import { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { database } from "../lib/database";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return {
      status: "ok",
    };
  });

  app.get("/health/db", async () => {
    const result = await database.execute(sql`SELECT 1`);

    return {
      status: "ok",
      database: "connected",
    };
  });
}
