import { z } from "zod";

export const projectOrganizationParamsSchema = z.object({
  organizationId: z.uuid(),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(100),

  key: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(/^[A-Z][A-Z0-9]*$/),

  description: z.string().trim().max(500).optional(),
});

export const projectParamsSchema = z.object({
  organizationId: z.uuid(),
  projectId: z.uuid(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  status: z
    .enum(["under_review", "active", "archived", "abandoned"])
    .optional(),
});
