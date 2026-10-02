import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";

import { database } from "../lib/database";
import { errors } from "../lib/app-errors";
import { validate } from "../lib/validate";
import { authenticationMiddleware } from "../middleware/authentication.middleware";

import { memberships, projects, taskComments, tasks } from "../db/schema";

import {
  commentIdParamsSchema,
  commentParamsSchema,
  createCommentSchema,
  updateCommentSchema,
} from "../validations/comment.validation";

export async function commentRoutes(app: FastifyInstance) {
  await app.register(async (protectedRoutes) => {
    await authenticationMiddleware(protectedRoutes);

    protectedRoutes.get(
      "/organizations/:organizationId/projects/:projectId/tasks/:taskId/comments",
      async (request, reply) => {
        const { organizationId, projectId, taskId } = validate(
          commentParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const [project] = await database
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!project) {
          throw errors.projectNotFound();
        }

        const [task] = await database
          .select({ id: tasks.id })
          .from(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (!task) {
          throw errors.taskNotFound();
        }

        const [membership] = await database
          .select({ id: memberships.id })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              eq(memberships.userId, request.user.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw errors.forbidden();
        }

        const comments = await database
          .select()
          .from(taskComments)
          .where(eq(taskComments.taskId, taskId))
          .orderBy(taskComments.createdAt);

        return reply.send({
          comments,
        });
      }
    );

    protectedRoutes.post(
      "/organizations/:organizationId/projects/:projectId/tasks/:taskId/comments",
      async (request, reply) => {
        const { organizationId, projectId, taskId } = validate(
          commentParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const { content } = validate(
          createCommentSchema,
          request.body,
          errors.invalidTaskData
        );

        const [project] = await database
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!project) {
          throw errors.projectNotFound();
        }

        const [task] = await database
          .select({ id: tasks.id })
          .from(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (!task) {
          throw errors.taskNotFound();
        }

        const [membership] = await database
          .select({ id: memberships.id })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              eq(memberships.userId, request.user.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw errors.forbidden();
        }

        const [comment] = await database
          .insert(taskComments)
          .values({
            taskId,
            userId: request.user.id,
            content,
            isEdited: false,
          })
          .returning();

        return reply.status(201).send({
          comment,
        });
      }
    );

    protectedRoutes.patch(
      "/organizations/:organizationId/projects/:projectId/tasks/:taskId/comments/:commentId",
      async (request, reply) => {
        const { organizationId, projectId, taskId, commentId } = validate(
          commentIdParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const { content } = validate(
          updateCommentSchema,
          request.body,
          errors.invalidTaskData
        );

        const [project] = await database
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!project) {
          throw errors.projectNotFound();
        }

        const [task] = await database
          .select({ id: tasks.id })
          .from(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (!task) {
          throw errors.taskNotFound();
        }

        const [membership] = await database
          .select({ id: memberships.id })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              eq(memberships.userId, request.user.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw errors.forbidden();
        }

        const [comment] = await database
          .select()
          .from(taskComments)
          .where(
            and(eq(taskComments.id, commentId), eq(taskComments.taskId, taskId))
          )
          .limit(1);

        if (!comment) {
          throw errors.taskNotFound();
        }

        if (comment.userId !== request.user.id) {
          throw errors.forbidden(
            "Only the comment author can edit this comment"
          );
        }

        const [updatedComment] = await database
          .update(taskComments)
          .set({
            content,
            isEdited: true,
            updatedAt: new Date(),
          })
          .where(eq(taskComments.id, commentId))
          .returning();

        return reply.send({
          comment: updatedComment,
        });
      }
    );

    protectedRoutes.delete(
      "/organizations/:organizationId/projects/:projectId/tasks/:taskId/comments/:commentId",
      async (request, reply) => {
        const { organizationId, projectId, taskId, commentId } = validate(
          commentIdParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const [project] = await database
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!project) {
          throw errors.projectNotFound();
        }

        const [task] = await database
          .select({ id: tasks.id })
          .from(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (!task) {
          throw errors.taskNotFound();
        }

        const [membership] = await database
          .select({
            id: memberships.id,
            role: memberships.role,
          })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              eq(memberships.userId, request.user.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw errors.forbidden();
        }

        const [comment] = await database
          .select({
            id: taskComments.id,
            userId: taskComments.userId,
          })
          .from(taskComments)
          .where(
            and(eq(taskComments.id, commentId), eq(taskComments.taskId, taskId))
          )
          .limit(1);

        if (!comment) {
          throw errors.taskNotFound();
        }

        const isAuthor = comment.userId === request.user.id;
        const isAdmin =
          membership.role === "owner" || membership.role === "admin";

        if (!isAuthor && !isAdmin) {
          throw errors.forbidden(
            "Only the comment author, owners, and admins can delete comments"
          );
        }

        await database
          .delete(taskComments)
          .where(eq(taskComments.id, commentId));

        return reply.status(204).send();
      }
    );
  });
}
