import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

import { healthRoutes } from "./routes/health.routes";
import { registerErrorHandler } from "./middleware/error-handler.middleware";
import { authRoutes } from "./routes/auth.routes";
import { organizationRoutes } from "./routes/organization.routes";
import { projectRoutes } from "./routes/project.routes";
import { taskRoutes } from "./routes/task.routes";
import { commentRoutes } from "./routes/comment.routes";
import { sprintRoutes } from "./routes/sprint.routes";

const app = Fastify({
  logger: true,
});

registerErrorHandler(app);

app.register(cookie);

app.register(cors, {
  origin: "http://localhost:3000",
  credentials: true,
});


app.register(healthRoutes);

app.register(authRoutes);

app.register(organizationRoutes);

app.register(projectRoutes);

app.register(taskRoutes);

app.register(commentRoutes);

app.register(sprintRoutes);

app.listen({ port: 4000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
