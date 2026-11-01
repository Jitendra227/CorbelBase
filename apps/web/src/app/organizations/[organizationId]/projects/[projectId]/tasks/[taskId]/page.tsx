import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getOrganization } from "@/lib/organizations/service";
import { getSprints } from "@/lib/sprints/service";
import { getTask, getTaskComments } from "@/lib/tasks/service";
import TaskDetail from "@/ui/task/TaskDetail";

export default async function Page({
  params,
}: {
  params: Promise<{
    organizationId: string;
    projectId: string;
    taskId: string;
  }>;
}) {
  const { organizationId, projectId, taskId } = await params;

  const [
    { task },
    { comments },
    userResponse,
    organizationResponse,
    { sprints },
  ] = await Promise.all([
    getTask(organizationId, projectId, taskId),
    getTaskComments(organizationId, projectId, taskId),
    getCurrentUser(),
    getOrganization(organizationId),
    getSprints(organizationId, projectId),
  ]);

  return (
    <TaskDetail
      organizationId={organizationId}
      task={task}
      comments={comments}
      currentUserId={userResponse.id}
      organizationRole={organizationResponse.organization.role}
      sprints={sprints}
    />
  );
}
