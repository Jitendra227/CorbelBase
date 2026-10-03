import { getTasks } from "@/lib/tasks/service";
import TaskList from "@/ui/task/TaskList";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string; projectId: string }>;
}) {
  const { organizationId, projectId } = await params;
  const { tasks } = await getTasks(organizationId, projectId);

  return (
    <TaskList
      organizationId={organizationId}
      projectId={projectId}
      tasks={tasks}
    />
  );
}
