import { getProjects } from "@/lib/projects/service";
import CreateProjectForm from "@/ui/project/CreateProjectForm";
import ProjectList from "@/ui/project/ProjectList";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const { projects } = await getProjects(organizationId);

  return (
    <>
      <CreateProjectForm organizationId={organizationId} />
      <ProjectList organizationId={organizationId} projects={projects} />
    </>
  );
}
