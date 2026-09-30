import { FastifyInstance } from "fastify";
import { getSession } from "../services/session";

export async function authenticationMiddleware(app: FastifyInstance) {
  app.addHook("preHandler", async (request, reply) => {
    const sessionId = request.cookies.sessionId;

    if (!sessionId) {
      return reply.status(401).send({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    const session = await getSession(sessionId);

    if (!session) {
      reply.clearCookie("sessionId", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      return reply.status(401).send({
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    request.user = {
      id: session.userId,
    };
  });
}
