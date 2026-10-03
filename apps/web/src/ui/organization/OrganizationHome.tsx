import type { Organization } from "@/lib/organizations/service";

interface OrganizationHomeProps {
  organization: Organization;
}

export default function OrganizationHome({
  organization,
}: OrganizationHomeProps) {
  return (
    <section>
      <h1>{organization.name}</h1>
      <p>Role: {organization.role}</p>
    </section>
  );
}
