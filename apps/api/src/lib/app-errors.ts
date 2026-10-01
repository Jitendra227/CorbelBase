export class AppError extends Error {
  constructor(public statusCode: number, public code: string, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export const errors = {
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
} as const;
