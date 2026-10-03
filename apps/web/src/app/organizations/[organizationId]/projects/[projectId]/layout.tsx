import type { ReactNode } from "react";

import ProjectNav from "@/ui/project/ProjectNav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string; projectId: string }>;
}) {
  const { organizationId, projectId } = await params;

  return (
    <>
      <ProjectNav organizationId={organizationId} projectId={projectId} />
      {children}
    </>
  );
}
