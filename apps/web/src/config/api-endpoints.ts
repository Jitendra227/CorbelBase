export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    register: "/auth/register",
  },
  organizations: {
    list: "/organizations",
    one: (organizationId: string) => `/organizations/${organizationId}`,
    members: (organizationId: string) =>
      `/organizations/${organizationId}/members`,
  },
  projects: {
    list: (organizationId: string) =>
      `/organizations/${organizationId}/projects`,
    one: (organizationId: string, projectId: string) =>
      `/organizations/${organizationId}/projects/${projectId}`,
  },
  tasks: {
    list: (organizationId: string, projectId: string) =>
      `/organizations/${organizationId}/projects/${projectId}/tasks`,
    one: (organizationId: string, projectId: string, taskId: string) =>
      `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}`,
  },
  comments: {
    list: (organizationId: string, projectId: string, taskId: string) =>
      `/organizations/${organizationId}/projects/${projectId}/tasks/${taskId}/comments`,
  },
  sprints: {
    list: (organizationId: string, projectId: string) =>
      `/organizations/${organizationId}/projects/${projectId}/sprints`,
    one: (organizationId: string, projectId: string, sprintId: string) =>
      `/organizations/${organizationId}/projects/${projectId}/sprints/${sprintId}`,
  },
} as const;
