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
  const { task } = await getTask(organizationId, projectId, taskId);
  const { comments } = await getTaskComments(
    organizationId,
    projectId,
    taskId
  );

  return <TaskDetail task={task} comments={comments} />;
}
