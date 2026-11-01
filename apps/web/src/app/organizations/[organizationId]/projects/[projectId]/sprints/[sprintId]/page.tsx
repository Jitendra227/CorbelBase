import { getSprint, getSprints, getSprintTasks } from "@/lib/sprints/service";
import { getUnassignedTasks } from "@/lib/tasks/service";
import SprintDetail from "@/ui/sprint/SprintDetail";

export default async function Page({
  params,
}: {
  params: Promise<{
    organizationId: string;
    projectId: string;
    sprintId: string;
  }>;
}) {
  const { organizationId, projectId, sprintId } = await params;

 const [{ sprint }, tasks, unassignedTasks, { sprints }] = await Promise.all([
   getSprint(organizationId, projectId, sprintId),
   getSprintTasks(organizationId, projectId, sprintId),
   getUnassignedTasks(organizationId, projectId),
   getSprints(organizationId, projectId),
 ]);

  return (
    <SprintDetail
      sprint={sprint}
      tasks={tasks}
      unassignedTasks={unassignedTasks}
      sprints={sprints}
      organizationId={organizationId}
      projectId={projectId}
    />
  );
}
