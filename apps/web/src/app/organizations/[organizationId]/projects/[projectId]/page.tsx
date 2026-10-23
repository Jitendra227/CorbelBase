import { getOrganization } from "@/lib/organizations/service";
import { getProject } from "@/lib/projects/service";
import { getTasks } from "@/lib/tasks/service";
import CreateTaskForm from "@/ui/task/CreateTaskForm";
import TaskList from "@/ui/task/TaskList";
import ProjectHome from "@/ui/project/ProjectHome";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string; projectId: string }>;
}) {
  const { organizationId, projectId } = await params;

  const [{ project }, { organization }, { tasks }] = await Promise.all([
    getProject(organizationId, projectId),
    getOrganization(organizationId),
    getTasks(organizationId, projectId),
  ]);

  const canManage =
    organization.role === "owner" || organization.role === "admin";

  return (
    <>
      <ProjectHome project={project} canManage={canManage} />
      <TaskList
        organizationId={organizationId}
        projectId={projectId}
        tasks={tasks}
      />
      <CreateTaskForm organizationId={organizationId} projectId={projectId} />
    </>
  );
}
