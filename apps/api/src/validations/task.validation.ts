import { z } from "zod";

export const taskProjectParamsSchema = z.object({
  organizationId: z.uuid(),
  projectId: z.uuid(),
});

export const createTaskSchema = z.object({
  type: z
    .enum(["feature", "bug", "chore", "improvement", "incident", "task"])
    .default("task"),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  assigneeId: z.uuid().optional(),
  sprintId: z.uuid().optional(),
});

export const taskParamsSchema = z.object({
  organizationId: z.uuid(),
  projectId: z.uuid(),
  taskId: z.uuid(),
});

export const updateTaskSchema = z.object({
  type: z
    .enum(["feature", "bug", "chore", "improvement", "incident", "task"])
    .optional(),
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z
    .enum([
      "in_review",
      "in_progress",
      "test_ready",
      "testing",
      "done",
      "closed",
      "abandoned",
      "reopened",
    ])
    .optional(),

  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assigneeId: z.uuid().nullable().optional(),
  sprintId: z.uuid().optional(),
});

export const taskListQuerySchema = z.object({
  status: z
    .enum([
      "in_review",
      "in_progress",
      "test_ready",
      "testing",
      "done",
      "closed",
      "abandoned",
      "reopened",
    ])
    .optional(),

  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  sprintId: z.uuid().nullable().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).max(100).optional(),

  sortBy: z
    .enum(["number", "createdAt", "updatedAt", "priority"])
    .default("number"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
