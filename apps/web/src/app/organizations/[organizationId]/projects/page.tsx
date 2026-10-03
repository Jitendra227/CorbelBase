import { getProjects } from "@/lib/projects/service";
import ProjectList from "@/ui/project/ProjectList";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const { projects } = await getProjects(organizationId);

  return (
    <ProjectList organizationId={organizationId} projects={projects} />
  );
}
