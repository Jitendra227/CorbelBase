import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const organizationIdSchema = z.object({
  organizationId: z.uuid(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(100),
});