export const PATHS = {
  home: "/",
  login: "/login",
  register: "/register",
  organizations: "/organizations",
  organization: (organizationId: string) => `/organizations/${organizationId}`,
  members: (organizationId: string) =>
    `/organizations/${organizationId}/members`,
  projects: (organizationId: string) =>
    `/organizations/${organizationId}/projects`,
  project: (organizationId: string, projectId: string) =>
    `/organizations/${organizationId}/projects/${projectId}`,
  tasks: (organizationId: string, projectId: string) =>
    `/organizations/${organizationId}/projects/${projectId}/tasks`,
  task: (organizationId: string, projectId: string, taskId: string) =>
    `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
  sprints: (organizationId: string, projectId: string) =>
    `/organizations/${organizationId}/projects/${projectId}/sprints`,
  sprint: (organizationId: string, projectId: string, sprintId: string) =>
    `/organizations/${organizationId}/projects/${projectId}/sprints/${sprintId}`,
} as const;
