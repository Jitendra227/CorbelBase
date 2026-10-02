import { z } from "zod";

export const sprintProjectParamsSchema = z.object({
  organizationId: z.uuid(),
  projectId: z.uuid(),
});

export const sprintParamsSchema = z.object({
  organizationId: z.uuid(),
  projectId: z.uuid(),
  sprintId: z.uuid(),
});

export const createSprintSchema = z.object({
  name: z.string().trim().min(2).max(100),
  goal: z.string().trim().max(500).optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
});

export const updateSprintSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  goal: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["planned", "active", "completed", "cancelled"]).optional(),
  startDate: z.iso.datetime().nullable().optional(),
  endDate: z.iso.datetime().nullable().optional(),
});
