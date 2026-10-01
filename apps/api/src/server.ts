import Fastify from "fastify";
import cookie from "@fastify/cookie";

import { healthRoutes } from "./routes/health.routes";
import { registerErrorHandler } from "./middleware/error-handler.middleware";
import { authRoutes } from "./routes/auth.routes";
import { organizationRoutes } from "./routes/organization.routes";
import { projectRoutes } from "./routes/project.routes";
import { taskRoutes } from "./routes/task.routes";

const app = Fastify({
  logger: true,
});

registerErrorHandler(app);

app.register(cookie);

app.register(healthRoutes);

app.register(authRoutes);

app.register(organizationRoutes);

app.register(projectRoutes);

app.register(taskRoutes);

app.listen({ port: 4000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
