import { getProject } from "@/lib/projects/service";
import ProjectHome from "@/ui/project/ProjectHome";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string; projectId: string }>;
}) {
  const { organizationId, projectId } = await params;
  const { project } = await getProject(organizationId, projectId);

  return <ProjectHome project={project} />;
}
