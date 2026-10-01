import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";

import { database } from "../lib/database";
import { errors } from "../lib/app-errors";
import { validate } from "../lib/validate";
import { authenticationMiddleware } from "../middleware/authentication.middleware";
import { memberships, projects } from "../db/schema";
import {
  createProjectSchema,
  projectOrganizationParamsSchema,
  projectParamsSchema,
  updateProjectSchema,
} from "../validations/project.validation";

export async function projectRoutes(app: FastifyInstance) {
  await app.register(async (protectedRoutes) => {
    await authenticationMiddleware(protectedRoutes);

    protectedRoutes.get(
      "/organizations/:organizationId/projects",
      async (request, reply) => {
        const { organizationId } = validate(
          projectOrganizationParamsSchema,
          request.params,
          errors.invalidOrganizationId
        );

        const [membership] = await database
          .select({
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
          throw errors.forbidden("You are not a member of this organization");
        }

        const organizationProjects = await database
          .select()
          .from(projects)
          .where(eq(projects.organizationId, organizationId));

        return reply.send({
          projects: organizationProjects,
        });
      }
    );

    protectedRoutes.get(
      "/organizations/:organizationId/projects/:projectId",
      async (request, reply) => {
        const { organizationId, projectId } = validate(
          projectParamsSchema,
          request.params,
          errors.invalidProjectParams
        );

        const [membership] = await database
          .select({ role: memberships.role })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              eq(memberships.userId, request.user.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw errors.forbidden("You are not a member of this organization");
        }

        const [project] = await database
          .select()
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

        return reply.send({ project });
      }
    );

    protectedRoutes.post(
      "/organizations/:organizationId/createproject",
      async (request, reply) => {
        const { organizationId } = validate(
          projectOrganizationParamsSchema,
          request.params,
          errors.invalidOrganizationId
        );

        const { name, key, description } = validate(
          createProjectSchema,
          request.body,
          errors.invalidProjectData
        );

        const [membership] = await database
          .select({
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
          throw errors.forbidden("You are not a member of this organization");
        }

        if (membership.role !== "owner" && membership.role !== "admin") {
          throw errors.forbidden(
            "Only organization owners and admins can create projects"
          );
        }

        const [project] = await database
          .insert(projects)
          .values({
            organizationId,
            name,
            key,
            description,
            createdBy: request.user.id,
          })
          .returning();

        return reply.status(201).send({ project });
      }
    );

    protectedRoutes.patch(
      "/organizations/:organizationId/projects/:projectId",
      async (request, reply) => {
        const { organizationId, projectId } = validate(
          projectParamsSchema,
          request.params,
          errors.invalidProjectParams
        );

        const { name, description, status } = validate(
          updateProjectSchema,
          request.body,
          errors.invalidProjectData
        );

        const [membership] = await database
          .select({ role: memberships.role })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              eq(memberships.userId, request.user.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw errors.forbidden("You are not a member of this organization");
        }

        if (membership.role !== "owner" && membership.role !== "admin") {
          throw errors.forbidden(
            "Only organization owners and admins can update projects"
          );
        }

        const [project] = await database
          .update(projects)
          .set({
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organizationId)
            )
          )
          .returning();

        if (!project) {
          throw errors.projectNotFound();
        }

        return reply.send({ project });
      }
    );

    protectedRoutes.delete(
      "/organizations/:organizationId/projects/:projectId",
      async (request, reply) => {
        const { organizationId, projectId } = validate(
          projectParamsSchema,
          request.params,
          errors.invalidProjectParams
        );

        const [membership] = await database
          .select({ role: memberships.role })
          .from(memberships)
          .where(
            and(
              eq(memberships.organizationId, organizationId),
              eq(memberships.userId, request.user.id)
            )
          )
          .limit(1);

        if (!membership) {
          throw errors.forbidden("You are not a member of this organization");
        }

        if (membership.role !== "owner" && membership.role !== "admin") {
          throw errors.forbidden(
            "Only organization owners and admins can delete projects"
          );
        }

        const [project] = await database
          .delete(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.organizationId, organizationId)
            )
          )
          .returning({ id: projects.id });

        if (!project) {
          throw errors.projectNotFound();
        }

        return reply.status(204).send();
      }
    );
  });
}
