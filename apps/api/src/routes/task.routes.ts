import { FastifyInstance } from "fastify";
import { and, asc, count, desc, eq, ilike, isNull, or } from "drizzle-orm";

import { database } from "../lib/database";
import { errors } from "../lib/app-errors";
import { validate } from "../lib/validate";
import { authenticationMiddleware } from "../middleware/authentication.middleware";

import { memberships, projects, sprints, tasks } from "../db/schema";

import {
  createTaskSchema,
  taskListQuerySchema,
  taskParamsSchema,
  taskProjectParamsSchema,
  updateTaskSchema,
} from "../validations/task.validation";

export async function taskRoutes(app: FastifyInstance) {
  await app.register(async (protectedRoutes) => {
    await authenticationMiddleware(protectedRoutes);

    protectedRoutes.post(
      "/organizations/:organizationId/projects/:projectId/createtask",
      async (request, reply) => {
        const { organizationId, projectId } = validate(
          taskProjectParamsSchema,
          request.params,
          errors.invalidProjectParams
        );

        const { type, title, description, priority, assigneeId, sprintId } =
          validate(createTaskSchema, request.body, errors.invalidTaskData);

        const [project] = await database
          .select({
            id: projects.id,
            key: projects.key,
          })
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

        if (sprintId) {
          const [sprint] = await database
            .select({
              id: sprints.id,
            })
            .from(sprints)
            .where(
              and(eq(sprints.id, sprintId), eq(sprints.projectId, projectId))
            )
            .limit(1);

          if (!sprint) {
            throw errors.invalidTaskData();
          }
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

        if (membership.role === "viewer") {
          throw errors.forbidden("Viewers cannot create tasks");
        }

        if (assigneeId) {
          const [assigneeMembership] = await database
            .select({
              id: memberships.id,
            })
            .from(memberships)
            .where(
              and(
                eq(memberships.organizationId, organizationId),
                eq(memberships.userId, assigneeId)
              )
            )
            .limit(1);

          if (!assigneeMembership) {
            throw errors.userNotFound();
          }
        }

        const [latestTask] = await database
          .select({
            number: tasks.number,
          })
          .from(tasks)
          .where(eq(tasks.projectId, projectId))
          .orderBy(desc(tasks.number))
          .limit(1);

        const nextNumber = (latestTask?.number ?? 0) + 1;
        const taskKey = `${project.key}-${nextNumber}`;

        const [task] = await database
          .insert(tasks)
          .values({
            projectId,
            number: nextNumber,
            type,
            key: taskKey,
            sprintId,
            title,
            description,
            priority,
            assigneeId,
            createdBy: request.user.id,
          })
          .returning();

        return reply.status(201).send({
          task,
        });
      }
    );

    protectedRoutes.get(
      "/organizations/:organizationId/projects/:projectId/tasks",
      async (request, reply) => {
        const { organizationId, projectId } = validate(
          taskProjectParamsSchema,
          request.params,
          errors.invalidProjectParams
        );

        const {
          status,
          priority,
          sprintId,
          search,
          page,
          limit,
          sortBy,
          sortOrder,
        } = validate(
          taskListQuerySchema,
          request.query,
          errors.invalidTaskData
        );

        const offset = (page - 1) * limit;

        const [project] = await database
          .select({
            id: projects.id,
          })
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

        const [membership] = await database
          .select({
            id: memberships.id,
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

        const filters = [eq(tasks.projectId, projectId)];

        if (search) {
          filters.push(
            or(
              ilike(tasks.title, `%${search}%`),
              ilike(tasks.key, `%${search}%`)
            )!
          );
        }

        if (status) {
          filters.push(eq(tasks.status, status));
        }
        if (priority) {
          filters.push(eq(tasks.priority, priority));
        }
        if (sprintId !== undefined) {
          filters.push(
            sprintId === null
              ? isNull(tasks.sprintId)
              : eq(tasks.sprintId, sprintId)
          );
        }

        const projectTasks = await database
          .select()
          .from(tasks)
          .where(and(...filters))
          .orderBy(
            sortOrder === "asc" ? asc(tasks[sortBy]) : desc(tasks[sortBy])
          )
          .limit(limit)
          .offset(offset);

        const [{ total }] = await database
          .select({
            total: count(),
          })
          .from(tasks)
          .where(and(...filters));

        const totalPages = Math.ceil(Number(total) / limit);

        return reply.send({
          tasks: projectTasks,
          pagination: {
            page,
            limit,
            total: Number(total),
            totalPages,
          },
        });
      }
    );

    protectedRoutes.get(
      "/organizations/:organizationId/projects/:projectId/tasks/:taskId",
      async (request, reply) => {
        const { organizationId, projectId, taskId } = validate(
          taskParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const [project] = await database
          .select({
            id: projects.id,
          })
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

        const [membership] = await database
          .select({
            id: memberships.id,
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

        const [task] = await database
          .select()
          .from(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (!task) {
          throw errors.taskNotFound();
        }

        return reply.send({
          task,
        });
      }
    );

    protectedRoutes.patch(
      "/organizations/:organizationId/projects/:projectId/tasks/:taskId",
      async (request, reply) => {
        const { organizationId, projectId, taskId } = validate(
          taskParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const updates = validate(
          updateTaskSchema,
          request.body,
          errors.invalidTaskData
        );

        if (updates.sprintId) {
          const [sprint] = await database
            .select({
              id: sprints.id,
            })
            .from(sprints)
            .where(
              and(
                eq(sprints.id, updates.sprintId),
                eq(sprints.projectId, projectId)
              )
            )
            .limit(1);

          if (!sprint) {
            throw errors.invalidTaskData();
          }
        }

        const [project] = await database
          .select({
            id: projects.id,
          })
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

        if (membership.role === "viewer") {
          throw errors.forbidden("Viewers cannot update tasks");
        }

        const [task] = await database
          .select()
          .from(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (!task) {
          throw errors.taskNotFound();
        }

        if (updates.assigneeId) {
          const [assigneeMembership] = await database
            .select({
              id: memberships.id,
            })
            .from(memberships)
            .where(
              and(
                eq(memberships.organizationId, organizationId),
                eq(memberships.userId, updates.assigneeId)
              )
            )
            .limit(1);

          if (!assigneeMembership) {
            throw errors.userNotFound();
          }
        }

        const [updatedTask] = await database
          .update(tasks)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, taskId))
          .returning();

        return reply.send({
          task: updatedTask,
        });
      }
    );

    protectedRoutes.delete(
      "/organizations/:organizationId/projects/:projectId/tasks/:taskId",
      async (request, reply) => {
        const { organizationId, projectId, taskId } = validate(
          taskParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const [project] = await database
          .select({
            id: projects.id,
          })
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

        if (membership.role !== "owner" && membership.role !== "admin") {
          throw errors.forbidden("Only owners and admins can delete tasks");
        }

        const [task] = await database
          .select({
            id: tasks.id,
          })
          .from(tasks)
          .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
          .limit(1);

        if (!task) {
          throw errors.taskNotFound();
        }

        await database.delete(tasks).where(eq(tasks.id, taskId));
        return reply.status(204).send();
      }
    );
  });
}
