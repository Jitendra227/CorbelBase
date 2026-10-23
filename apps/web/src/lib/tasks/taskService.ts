import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import type { Task, TaskComment } from "@/lib/tasks/service";

interface CreateTaskInput {
  type?: "feature" | "bug" | "chore" | "improvement" | "incident" | "task";
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  sprintId?: string;
}

export function createTask(
  organizationId: string,
  projectId: string,
  data: CreateTaskInput
) {
  return apiClient<{ task: Task }>(
    API_ENDPOINTS.tasks.create(organizationId, projectId),
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateTask(
  organizationId: string,
  projectId: string,
  taskId: string,
  data: {
    status?:
      | "in_review"
      | "in_progress"
      | "test_ready"
      | "testing"
      | "done"
      | "closed"
      | "abandoned"
      | "reopened";
    priority?: "low" | "medium" | "high" | "critical";
  }
) {
  return apiClient<{ task: Task }>(
    API_ENDPOINTS.tasks.one(organizationId, projectId, taskId),
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

export function createTaskComment(
  organizationId: string,
  projectId: string,
  taskId: string,
  content: string
) {
  return apiClient<{ comment: TaskComment }>(
    API_ENDPOINTS.comments.list(organizationId, projectId, taskId),
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );
}

export function updateTaskComment(
  organizationId: string,
  projectId: string,
  taskId: string,
  commentId: string,
  content: string
) {
  return apiClient<{ comment: TaskComment }>(
    API_ENDPOINTS.comments.one(organizationId, projectId, taskId, commentId),
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }
  );
}

export function deleteTaskComment(
  organizationId: string,
  projectId: string,
  taskId: string,
  commentId: string
) {
  return apiClient<void>(
    API_ENDPOINTS.comments.one(organizationId, projectId, taskId, commentId),
    {
      method: "DELETE",
    }
  );
}
