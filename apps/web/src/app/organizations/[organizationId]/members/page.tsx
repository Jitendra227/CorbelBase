import { getOrganizationMembers } from "@/lib/organizations/service";
import MemberList from "@/ui/organization/MemberList";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const { organization, members } =
    await getOrganizationMembers(organizationId);

  return <MemberList organizationName={organization} members={members} />;
}
