import { FastifyInstance } from "fastify";
import { and, eq } from "drizzle-orm";
import { database } from "../lib/database";
import { memberships, organizations, users } from "../db/schema";
import {
  addOrganizationMemberSchema,
  createOrganizationSchema,
  organizationIdSchema,
  organizationMemberParamsSchema,
  updateOrganizationMemberSchema,
  updateOrganizationSchema,
} from "../validations/organization.validation";
import { authenticationMiddleware } from "../middleware/authentication.middleware";
import { errors } from "../lib/app-errors";
import { validate } from "../lib/validate";

export async function organizationRoutes(app: FastifyInstance) {
  await app.register(async (protectedRoute) => {
    await authenticationMiddleware(protectedRoute);

    protectedRoute.get("/organizations", async (request, reply) => {
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
        const { organizationId } = validate(
          organizationIdSchema,
          request.params,
          errors.invalidOrganizationId
        );

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
          throw errors.organizationNotFound();
        }

        return reply.send({ organization });
      }
    );

    protectedRoute.post("/organizations", async (request, reply) => {
      const { name } = validate(
        createOrganizationSchema,
        request.body,
        errors.invalidOrganizationData
      );

      const result = await database.transaction(async (org) => {
        const [organization] = await org
          .insert(organizations)
          .values({ name })
          .returning();

        await org.insert(memberships).values({
          userId: request.user.id,
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
        const { organizationId } = validate(
          organizationIdSchema,
          request.params,
          errors.invalidOrganizationId
        );

        const { name } = validate(
          updateOrganizationSchema,
          request.body,
          errors.invalidOrganizationData
        );

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
          throw errors.organizationNotFound();
        }

        if (membership.role !== "owner" && membership.role !== "admin") {
          throw errors.forbidden();
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

    protectedRoute.get(
      "/organizations/:organizationId/members",
      async (request, reply) => {
        const { organizationId } = validate(
          organizationIdSchema,
          request.params,
          errors.invalidOrganizationId
        );

        const [organization] = await database
          .select({
            id: organizations.id,
            name: organizations.name,
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
          throw errors.organizationNotFound();
        }

        const members = await database
          .select({
            userId: users.id,
            name: users.name,
            email: users.email,
            role: memberships.role,
            joinedAt: memberships.createdAt,
          })
          .from(memberships)
          .innerJoin(users, eq(memberships.userId, users.id))
          .where(eq(memberships.organizationId, organizationId));

        return reply.send({
          organization: organization.name,
          members,
        });
      }
    );

    protectedRoute.post(
      "/organizations/:organizationId/members",
      async (request, reply) => {
        const { organizationId } = validate(
          organizationIdSchema,
          request.params,
          errors.invalidOrganizationId
        );

        const { email, role } = validate(
          addOrganizationMemberSchema,
          request.body,
          errors.invalidOrganizationData
        );

        const [requesterMembership] = await database
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

        if (!requesterMembership) {
          throw errors.organizationNotFound();
        }

        if (
          requesterMembership.role !== "owner" &&
          requesterMembership.role !== "admin"
        ) {
          throw errors.forbidden();
        }

        const [user] = await database
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          throw errors.userNotFound();
        }

        const [existingMembership] = await database
          .select({
            id: memberships.id,
          })
          .from(memberships)
          .where(
            and(
              eq(memberships.userId, user.id),
              eq(memberships.organizationId, organizationId)
            )
          )
          .limit(1);

        if (existingMembership) {
          throw errors.alreadyMember();
        }

        const [membership] = await database
          .insert(memberships)
          .values({
            userId: user.id,
            organizationId,
            role,
          })
          .returning();

        return reply.status(201).send({
          message: "member added to organization",
          member: {
            ...user,
            role: membership.role,
            joinedAt: membership.createdAt,
          },
        });
      }
    );

    protectedRoute.patch(
      "/organizations/:organizationId/members/:userId/role",
      async (request, reply) => {
        const { organizationId, userId } = validate(
          organizationMemberParamsSchema,
          request.params,
          errors.invalidOrganizationId
        );

        const { role } = validate(
          updateOrganizationMemberSchema,
          request.body,
          errors.invalidOrganizationData
        );

        const [requesterMembership] = await database
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

        if (!requesterMembership) {
          throw errors.organizationNotFound();
        }

        if (
          requesterMembership.role !== "owner" &&
          requesterMembership.role !== "admin"
        ) {
          throw errors.forbidden();
        }

        const [targetMembership] = await database
          .select({
            id: memberships.id,
            role: memberships.role,
          })
          .from(memberships)
          .where(
            and(
              eq(memberships.userId, userId),
              eq(memberships.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!targetMembership) {
          throw errors.userNotFound();
        }

        // Don't allow changing the owner's role
        if (targetMembership.role === "owner") {
          throw errors.forbidden(
            "The organization owner role cannot be changed"
          );
        }

        // Admin cannot promote someone to admin
        if (requesterMembership.role === "admin" && role === "admin") {
          throw errors.forbidden(
            "Only the organization owner can assign the admin role"
          );
        }

        const [updatedMembership] = await database
          .update(memberships)
          .set({
            role,
          })
          .where(eq(memberships.id, targetMembership.id))
          .returning();
        return reply.send({
          message: "member role updated",
          membership: updatedMembership,
        });
      }
    );

    protectedRoute.delete(
      "/organizations/:organizationId/members/:userId",
      async (request, reply) => {
        const { organizationId, userId } = validate(
          organizationMemberParamsSchema,
          request.params,
          errors.invalidOrganizationId
        );

        const [requesterMembership] = await database
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
        if (!requesterMembership) {
          throw errors.organizationNotFound();
        }

        if (
          requesterMembership.role !== "owner" &&
          requesterMembership.role !== "admin"
        ) {
          throw errors.forbidden();
        }

        const [targetMembership] = await database
          .select({
            id: memberships.id,
            role: memberships.role,
          })
          .from(memberships)
          .where(
            and(
              eq(memberships.userId, userId),
              eq(memberships.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!targetMembership) {
          throw errors.userNotFound();
        }

        if (targetMembership.role === "owner") {
          throw errors.forbidden("The organization owner cannot be removed");
        }

        if (
          requesterMembership.role === "admin" &&
          targetMembership.role === "admin"
        ) {
          throw errors.forbidden("Admins cannot remove other admins");
        }

        await database
          .delete(memberships)
          .where(eq(memberships.id, targetMembership.id));

        return reply.send({
          message: "member removed",
        });
      }
    );
  });
}
