import { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { database } from "../lib/database";
import { users } from "../db/schema";
import { authSchema, loginSchema } from "../validations/auth.validation";
import { hashPassword, verifyPassword } from "../lib/passwords";
import { createSession, deleteSession } from "../services/session";
import { authenticationMiddleware } from "../middleware/authentication.middleware";
import { errors } from "../lib/app-errors";
import { validate } from "../lib/validate";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const { name, email, password } = validate(
      authSchema,
      request.body,
      errors.invalidRegistrationData
    );

    const existingUser = await database
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw errors.userExists();
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
    const { email, password } = validate(
      loginSchema,
      request.body,
      errors.invalidLoginData
    );

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
      throw errors.invalidCredentials();
    }

    const validPassword = await verifyPassword(user.passwordHash, password);

    if (!validPassword) {
      throw errors.invalidCredentials();
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
        throw errors.unauthorized();
      }

      return reply.send({ user });
    });
  });
}
