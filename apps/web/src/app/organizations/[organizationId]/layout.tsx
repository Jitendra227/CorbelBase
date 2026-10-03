import type { ReactNode } from "react";

import OrganizationNav from "@/ui/organization/OrganizationNav";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;

  return (
    <>
      <OrganizationNav organizationId={organizationId} />
      {children}
    </>
  );
}
