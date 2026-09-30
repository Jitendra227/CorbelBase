import { z } from "zod";

export const authSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.email().trim().max(255),
  password: z.string().min(8).max(128),
});
