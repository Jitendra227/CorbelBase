import {
  getOrganization,
  getOrganizationMembers,
} from "@/lib/organizations/service";
import MemberList from "@/ui/organization/MemberList";
import AddOrganizationMemberForm from "@/ui/organization/AddOrganizationMemberForm";

export default async function Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;

  const [organizationResult, membersResult] = await Promise.all([
    getOrganization(organizationId),
    getOrganizationMembers(organizationId),
  ]);

  return (
    <>
      <MemberList
        organizationId={organizationId}
        organizationName={membersResult.organization}
        members={membersResult.members}
        currentRole={organizationResult.organization.role}
      />

      {(organizationResult.organization.role === "owner" ||
        organizationResult.organization.role === "admin") && (
        <AddOrganizationMemberForm
          organizationId={organizationId}
          currentRole={organizationResult.organization.role}
        />
      )}
    </>
  );
}
