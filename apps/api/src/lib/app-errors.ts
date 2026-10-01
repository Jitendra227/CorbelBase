export class AppError extends Error {
  constructor(public statusCode: number, public code: string, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export const errors = {
  userExists: () =>
    new AppError(409, "USER_EXISTS", "A user with this email already exists"),

  invalidCredentials: () =>
    new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password"),

  invalidRegistrationData: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid registration data"),

  invalidLoginData: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid login data"),

  unauthorized: () =>
    new AppError(401, "UNAUTHORIZED", "Authentication required"),

  invalidOrganizationId: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid organization ID"),

  invalidOrganizationData: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid organization data"),

  organizationNotFound: () =>
    new AppError(404, "ORGANIZATION_NOT_FOUND", "Organization not found"),

  forbidden: (message = "You do not have permission to perform this action") =>
    new AppError(403, "FORBIDDEN", message),

  userNotFound: () => new AppError(404, "USER_NOT_FOUND", "User not found"),

  alreadyMember: () =>
    new AppError(
      409,
      "ALREADY_MEMBER",
      "User is already a member of this organization"
    ),

  invalidProjectData: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid project data"),

  projectKeyExists: () =>
    new AppError(
      409,
      "PROJECT_KEY_EXISTS",
      "A project with this key already exists in this organization"
    ),

  invalidProjectParams: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid project parameters"),

  projectNotFound: () =>
    new AppError(404, "PROJECT_NOT_FOUND", "Project not found"),

  invalidTaskData: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid task data"),

  taskNotFound: () => new AppError(404, "TASK_NOT_FOUND", "Task not found"),

  invalidTaskParams: () =>
    new AppError(400, "INVALID_REQUEST", "Invalid task parameters"),
} as const;
