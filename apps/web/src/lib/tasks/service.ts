import { API_ENDPOINTS } from "@/config/api-endpoints";
import { serverApiClient } from "@/lib/api/server-client";

export interface Task {
  id: string;
  projectId: string;
  number: number;
  key: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  sprintId: string | null;
  assigneeId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TasksResponse {
  tasks: Task[];
}

interface TaskResponse {
  task: Task;
}

interface CommentsResponse {
  comments: TaskComment[];
}

export function getTasks(organizationId: string, projectId: string) {
  return serverApiClient<TasksResponse>(
    API_ENDPOINTS.tasks.list(organizationId, projectId)
  );
}

export function getTask(
  organizationId: string,
  projectId: string,
  taskId: string
) {
  return serverApiClient<TaskResponse>(
    API_ENDPOINTS.tasks.one(organizationId, projectId, taskId)
  );
}

export function getTaskComments(
  organizationId: string,
  projectId: string,
  taskId: string
) {
  return serverApiClient<CommentsResponse>(
    API_ENDPOINTS.comments.list(organizationId, projectId, taskId)
  );
}
