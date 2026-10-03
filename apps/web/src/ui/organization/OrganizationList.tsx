import Link from "next/link";

import { PATHS } from "@/config/paths";
import type { Organization } from "@/lib/organizations/service";

interface OrganizationListProps {
  userName: string;
  organizations: Organization[];
}

export default function OrganizationList({
  userName,
  organizations,
}: OrganizationListProps) {
  return (
    <section>
      <h1>Organizations</h1>
      <p>Welcome, {userName}!</p>

      {organizations.length === 0 ? (
        <p>You don&apos;t belong to any organizations yet.</p>
      ) : (
        <ul>
          {organizations.map((organization) => (
            <li key={organization.id}>
              <Link href={PATHS.organization(organization.id)}>
                <strong>{organization.name}</strong>
              </Link>
              <span> — {organization.role}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
