import { z } from "zod";

export const commentParamsSchema = z.object({
  organizationId: z.uuid(),
  projectId: z.uuid(),
  taskId: z.uuid(),
});

export const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

export const commentIdParamsSchema = z.object({
  organizationId: z.uuid(),
  projectId: z.uuid(),
  taskId: z.uuid(),
  commentId: z.uuid(),
});

export const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});
