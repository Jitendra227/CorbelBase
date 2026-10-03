import { getSprints } from "@/lib/sprints/service";
import SprintList from "@/ui/sprint/SprintList";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string; projectId: string }>;
}) {
  const { organizationId, projectId } = await params;
  const { sprints } = await getSprints(organizationId, projectId);

  return (
    <SprintList
      organizationId={organizationId}
      projectId={projectId}
      sprints={sprints}
    />
  );
}
