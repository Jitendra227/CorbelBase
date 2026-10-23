import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import type { Project } from "@/lib/projects/service";

export function createProject(
  organizationId: string,
  name: string,
  key: string,
  description?: string
) {
  return apiClient<{ project: Project }>(
    API_ENDPOINTS.projects.create(organizationId),
    {
      method: "POST",
      body: JSON.stringify({ name, key, description }),
    }
  );
}

export function updateProjectStatus(
  organizationId: string,
  projectId: string,
  status: Project["status"]
) {
  return apiClient<{ project: Project }>(
    API_ENDPOINTS.projects.one(organizationId, projectId),
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}

export function updateProject(
  organizationId: string,
  projectId: string,
  data: {
    name?: string;
    description?: string;
  }
) {
  return apiClient<{ project: Project }>(
    API_ENDPOINTS.projects.one(organizationId, projectId),
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export function deleteProject(organizationId: string, projectId: string) {
  return apiClient<void>(
    API_ENDPOINTS.projects.one(organizationId, projectId),
    {
      method: "DELETE",
    }
  );
}