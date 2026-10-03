import { API_ENDPOINTS } from "@/config/api-endpoints";
import { serverApiClient } from "@/lib/api/server-client";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: "planned" | "active" | "completed" | "cancelled";
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SprintsResponse {
  sprints: Sprint[];
}

interface SprintResponse {
  sprint: Sprint;
}

export function getSprints(organizationId: string, projectId: string) {
  return serverApiClient<SprintsResponse>(
    API_ENDPOINTS.sprints.list(organizationId, projectId)
  );
}

export function getSprint(
  organizationId: string,
  projectId: string,
  sprintId: string
) {
  return serverApiClient<SprintResponse>(
    API_ENDPOINTS.sprints.one(organizationId, projectId, sprintId)
  );
}
