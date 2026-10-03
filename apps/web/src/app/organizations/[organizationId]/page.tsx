import { getOrganization } from "@/lib/organizations/service";
import OrganizationHome from "@/ui/organization/OrganizationHome";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const { organization } = await getOrganization(organizationId);

  return <OrganizationHome organization={organization} />;
}
