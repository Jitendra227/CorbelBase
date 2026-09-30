import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { database } from "../lib/database";
import { organizations, memberships } from "../db/schema";
import {
  createOrganizationSchema,
  organizationIdSchema,
  updateOrganizationSchema,
} from "../validations/organization.validation";
import { authenticationMiddleware } from "../middleware/authentication.middleware";

export async function organizationRoutes(app: FastifyInstance) {
  await app.register(async (protectedRoute) => {
    await authenticationMiddleware(protectedRoute);

    protectedRoute.get("/organizations", async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication Required",
          },
        });
      }

      const userOrganizations = await database
        .select({
          id: organizations.id,
          name: organizations.name,
          role: memberships.role,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
        })
        .from(memberships)
        .innerJoin(
          organizations,
          eq(memberships.organizationId, organizations.id)
        )
        .where(eq(memberships.userId, request.user.id));

      return reply.send({
        organizations: userOrganizations,
      });
    });

    protectedRoute.get(
      "/organizations/:organizationId",
      async (request, reply) => {
        if (!request.user) {
          return reply.status(401).send({
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication Required",
            },
          });
        }

        const parsedParams = organizationIdSchema.safeParse(request.params);

        if (!parsedParams.success) {
          return reply.status(400).send({
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid organization ID",
            },
          });
        }

        const { organizationId } = parsedParams.data;

        const [organization] = await database
          .select({
            id: organizations.id,
            name: organizations.name,
            role: memberships.role,
            createdAt: organizations.createdAt,
            updatedAt: organizations.updatedAt,
          })
          .from(memberships)
          .innerJoin(
            organizations,
            eq(memberships.organizationId, organizations.id)
          )
          .where(
            and(
              eq(memberships.userId, request.user.id),
              eq(memberships.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!organization) {
          return reply.status(404).send({
            error: {
              code: "ORGANIZATION_NOT_FOUND",
              message: "Organization not found",
            },
          });
        }

        return reply.send({ organization });
      }
    );

    protectedRoute.post("/organizations", async (request, reply) => {
      const parsedBody = createOrganizationSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          error: {
            code: "INVALID_REQUEST",
            message: "Invalid organization data",
          },
        });
      }

      if (!request.user) {
        return reply.status(401).send({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication Required",
          },
        });
      }

      const { name } = parsedBody.data;

      const result = await database.transaction(async (org) => {
        const [organization] = await org
          .insert(organizations)
          .values({ name })
          .returning();

        await org.insert(memberships).values({
          userId: request.user!.id,
          organizationId: organization.id,
          role: "owner",
        });

        return organization;
      });

      return reply.status(201).send({
        organization: result,
      });
    });

    protectedRoute.patch(
      "/organizations/:organizationId",
      async (request, reply) => {
        if (!request.user) {
          return reply.status(401).send({
            error: {
              code: "UNAUTHORIZED",
              message: "Authentication required",
            },
          });
        }

        const parsedParams = organizationIdSchema.safeParse(request.params);

        if (!parsedParams.success) {
          return reply.status(400).send({
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid organization ID",
            },
          });
        }

        const parsedBody = updateOrganizationSchema.safeParse(request.body);

        if (!parsedBody.success) {
          return reply.status(400).send({
            error: {
              code: "INVALID_REQUEST",
              message: "Invalid organization data",
            },
          });
        }

        const { organizationId } = parsedParams.data;
        const { name } = parsedBody.data;

        const [membership] = await database
          .select({
            role: memberships.role,
          })
          .from(memberships)
          .where(
            and(
              eq(memberships.userId, request.user.id),
              eq(memberships.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!membership) {
          return reply.status(404).send({
            error: {
              code: "ORGANIZATION_NOT_FOUND",
              message: "Organization not found",
            },
          });
        }

        if (membership.role !== "owner" && membership.role !== "admin") {
          return reply.status(403).send({
            error: {
              code: "FORBIDDEN",
              message: "You do not have permission to update this organization",
            },
          });
        }

        const [organization] = await database
          .update(organizations)
          .set({
            name,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, organizationId))
          .returning();

        return reply.send({
          organization,
        });
      }
    );
  });
}
