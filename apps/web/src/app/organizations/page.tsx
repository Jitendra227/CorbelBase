import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getOrganizations } from "@/lib/organizations/service";
import OrganizationList from "@/ui/organization/OrganizationList";

export default async function Page() {
  const user = await getCurrentUser();
  const { organizations } = await getOrganizations();

  return (
    <OrganizationList userName={user.name} organizations={organizations} />
  );
}
