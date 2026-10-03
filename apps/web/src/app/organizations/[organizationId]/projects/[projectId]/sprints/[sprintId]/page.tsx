import { getSprint } from "@/lib/sprints/service";
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
  const { sprint } = await getSprint(organizationId, projectId, sprintId);

  return <SprintDetail sprint={sprint} />;
}
