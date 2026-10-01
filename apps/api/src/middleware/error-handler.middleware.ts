import { FastifyInstance } from "fastify";
import { AppError } from "../lib/app-errors";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
  });
}
