import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import type { Sprint } from "@/lib/sprints/service";

export function createSprint(
  organizationId: string,
  projectId: string,
  data: {
    name: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  return apiClient<{ sprint: Sprint }>(
    API_ENDPOINTS.sprints.list(organizationId, projectId),
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateSprint(
  organizationId: string,
  projectId: string,
  sprintId: string,
  data: {
    name?: string;
    goal?: string | null;
    status?: Sprint["status"];
    startDate?: string | null;
    endDate?: string | null;
  }
) {
  return apiClient<{ sprint: Sprint }>(
    API_ENDPOINTS.sprints.one(organizationId, projectId, sprintId),
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export type SprintTaskDecision =
  | {
      taskId: string;
      action: "close";
    }
  | {
      taskId: string;
      action: "rollover";
      destinationSprintId: string;
    };

export function completeSprint(
  organizationId: string,
  projectId: string,
  sprintId: string,
  decisions: SprintTaskDecision[]
) {
  return apiClient<{ sprint: Sprint }>(
    API_ENDPOINTS.sprints.complete(organizationId, projectId, sprintId),
    {
      method: "POST",
      body: JSON.stringify({ decisions }),
    }
  );
}
