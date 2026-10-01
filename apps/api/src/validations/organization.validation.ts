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

export const addOrganizationMemberSchema = z.object({
  email: z.email().trim().max(255),
  role: z.enum(["admin", "developer", "viewer"]),
});

export const updateOrganizationMemberSchema = z.object({
  role: z.enum(["admin", "developer", "viewer"]),
});

export const organizationMemberParamsSchema = z.object({
  organizationId: z.uuid(),
  userId: z.uuid(),
});
