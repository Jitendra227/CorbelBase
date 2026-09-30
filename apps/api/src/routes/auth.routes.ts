import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { database } from "../lib/database";
import { users } from "../db/schema";
import { authSchema, loginSchema } from "../validations/auth.validation";
import { hashPassword, verifyPassword } from "../lib/passwords";
import { createSession, deleteSession } from "../services/session";
import { authenticationMiddleware } from "../middleware/authentication.middleware";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const parsedBody = authSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid registration data",
        },
      });
    }

    const { name, email, password } = parsedBody.data;

    const existingUser = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return reply.status(409).send({
        error: {
          code: "USER_EXISTS",
          message: "A user with this email already exists",
        },
      });
    }

    const passwordHash = await hashPassword(password);

    const [user] = await database
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    return reply.status(201).send({ user });
  });

  app.post("/auth/login", async (request, reply) => {
    const parsedBody = loginSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid login data",
        },
      });
    }

    const { email, password } = parsedBody.data;

    const [user] = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return reply.status(401).send({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const validPassword = await verifyPassword(user.passwordHash, password);

    if (!validPassword) {
      return reply.status(401).send({
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const session = await createSession(user.id);

    reply.setCookie("sessionId", session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: session.expiresAt,
    });

    return reply.send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });

  app.post("/auth/logout", async (request, reply) => {
    const sessionId = request.cookies.sessionId;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    reply.clearCookie("sessionId", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return reply.send({ message: "Logged out successfully" });
  });

  await app.register(async (protectedRoutes) => {
    await authenticationMiddleware(protectedRoutes);

    protectedRoutes.get("/auth/me", async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
      }

      const [user] = await database
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, request.user.id))
        .limit(1);

      if (!user) {
        return reply.status(401).send({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
      }

      return reply.send({ user });
    });
  });
}
