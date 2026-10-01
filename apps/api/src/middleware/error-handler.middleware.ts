import { FastifyError, FastifyInstance } from "fastify";
import { AppError } from "../lib/app-errors";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (isUniqueConstraintError(error)) {
      return reply.status(409).send({
        error: {
          code: "CONFLICT",
          message: "A record with these values already exists",
        },
      });
    }

    if ("statusCode" in error && typeof error.statusCode === "number") {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code ?? "BAD_REQUEST",
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

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("code" in error && error.code === "23505") {
    return true;
  }

  if ("cause" in error) {
    return isUniqueConstraintError(error.cause);
  }

  return false;
}
