import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";

import { database } from "../lib/database";
import { errors } from "../lib/app-errors";
import { validate } from "../lib/validate";
import { authenticationMiddleware } from "../middleware/authentication.middleware";

import { memberships, projects, sprints, tasks } from "../db/schema";

import {
  createSprintSchema,
  sprintParamsSchema,
  sprintProjectParamsSchema,
  updateSprintSchema,
} from "../validations/sprint.validation";

export async function sprintRoutes(app: FastifyInstance) {
  await app.register(async (protectedRoutes) => {
    await authenticationMiddleware(protectedRoutes);

    protectedRoutes.get(
      "/organizations/:organizationId/projects/:projectId/sprints",
      async (request, reply) => {
        const { organizationId, projectId } = validate(
          sprintProjectParamsSchema,
          request.params,
          errors.invalidProjectParams
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

        const projectSprints = await database
          .select()
          .from(sprints)
          .where(eq(sprints.projectId, projectId))
          .orderBy(sprints.createdAt);

        return reply.send({
          sprints: projectSprints,
        });
      }
    );

    protectedRoutes.get(
      "/organizations/:organizationId/projects/:projectId/sprints/:sprintId",
      async (request, reply) => {
        const { organizationId, projectId, sprintId } = validate(
          sprintParamsSchema,
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

        const [sprint] = await database
          .select()
          .from(sprints)
          .where(
            and(eq(sprints.id, sprintId), eq(sprints.projectId, projectId))
          )
          .limit(1);

        if (!sprint) {
          throw errors.taskNotFound();
        }

        return reply.send({
          sprint,
        });
      }
    );

    app.get(
      "/organizations/:organizationId/projects/:projectId/sprints/:sprintId/tasks",
      async (request) => {
        const params = validate(
          sprintParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const { organizationId, projectId, sprintId } = params;

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

        const [sprint] = await database
          .select({ id: sprints.id })
          .from(sprints)
          .where(
            and(eq(sprints.id, sprintId), eq(sprints.projectId, projectId))
          )
          .limit(1);

        if (!sprint) {
          throw errors.invalidTaskData();
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

        return database
          .select()
          .from(tasks)
          .where(eq(tasks.sprintId, sprintId));
      }
    );

    protectedRoutes.post(
      "/organizations/:organizationId/projects/:projectId/sprints",
      async (request, reply) => {
        const { organizationId, projectId } = validate(
          sprintProjectParamsSchema,
          request.params,
          errors.invalidProjectParams
        );

        const { name, goal, startDate, endDate } = validate(
          createSprintSchema,
          request.body,
          errors.invalidTaskData
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

        if (membership.role === "viewer") {
          throw errors.forbidden("Viewers cannot create sprints");
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
          throw errors.invalidTaskData();
        }

        const [sprint] = await database
          .insert(sprints)
          .values({
            projectId,
            name,
            goal,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
          })
          .returning();

        return reply.status(201).send({
          sprint,
        });
      }
    );

    protectedRoutes.patch(
      "/organizations/:organizationId/projects/:projectId/sprints/:sprintId",
      async (request, reply) => {
        const { organizationId, projectId, sprintId } = validate(
          sprintParamsSchema,
          request.params,
          errors.invalidTaskParams
        );

        const updates = validate(
          updateSprintSchema,
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
          throw errors.forbidden("Viewers cannot update sprints");
        }

        const [sprint] = await database
          .select()
          .from(sprints)
          .where(
            and(eq(sprints.id, sprintId), eq(sprints.projectId, projectId))
          )
          .limit(1);

        if (!sprint) {
          throw errors.taskNotFound();
        }

        const startDate =
          updates.startDate !== undefined
            ? updates.startDate
              ? new Date(updates.startDate)
              : null
            : undefined;

        const endDate =
          updates.endDate !== undefined
            ? updates.endDate
              ? new Date(updates.endDate)
              : null
            : undefined;

        const effectiveStartDate =
          startDate !== undefined ? startDate : sprint.startDate;

        const effectiveEndDate =
          endDate !== undefined ? endDate : sprint.endDate;

        if (
          effectiveStartDate &&
          effectiveEndDate &&
          effectiveEndDate < effectiveStartDate
        ) {
          throw errors.invalidTaskData();
        }

        const [updatedSprint] = await database
          .update(sprints)
          .set({
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.goal !== undefined && { goal: updates.goal }),
            ...(updates.status !== undefined && { status: updates.status }),
            ...(startDate !== undefined && { startDate }),
            ...(endDate !== undefined && { endDate }),
            updatedAt: new Date(),
          })
          .where(eq(sprints.id, sprintId))
          .returning();

        return reply.send({
          sprint: updatedSprint,
        });
      }
    );

    protectedRoutes.delete(
      "/organizations/:organizationId/projects/:projectId/sprints/:sprintId",
      async (request, reply) => {
        const { organizationId, projectId, sprintId } = validate(
          sprintParamsSchema,
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
          throw errors.forbidden("Only owners and admins can delete sprints");
        }

        const [sprint] = await database
          .select({ id: sprints.id })
          .from(sprints)
          .where(
            and(eq(sprints.id, sprintId), eq(sprints.projectId, projectId))
          )
          .limit(1);

        if (!sprint) {
          throw errors.taskNotFound();
        }

        await database.delete(sprints).where(eq(sprints.id, sprintId));

        return reply.status(204).send();
      }
    );
  });
}
