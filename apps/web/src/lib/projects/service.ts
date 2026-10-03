import { API_ENDPOINTS } from "@/config/api-endpoints";
import { serverApiClient } from "@/lib/api/server-client";

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  description: string | null;
  status: "under_review" | "active" | "archived" | "abandoned";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsResponse {
  projects: Project[];
}

interface ProjectResponse {
  project: Project;
}

export function getProjects(organizationId: string) {
  return serverApiClient<ProjectsResponse>(
    API_ENDPOINTS.projects.list(organizationId)
  );
}

export function getProject(organizationId: string, projectId: string) {
  return serverApiClient<ProjectResponse>(
    API_ENDPOINTS.projects.one(organizationId, projectId)
  );
}
