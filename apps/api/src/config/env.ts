import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PGHOST: z.string().min(1),
  PGPORT: z.coerce.number().int().positive(),
  PGDATABASE: z.string().min(1),
  PGUSER: z.string().min(1),
  PGPASSWORD: z.string().min(1),
});

export const env = envSchema.parse(process.env);