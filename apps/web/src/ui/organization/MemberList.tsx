import type { OrganizationMember } from "@/lib/organizations/service";

interface MemberListProps {
  organizationName: string;
  members: OrganizationMember[];
}

export default function MemberList({
  organizationName,
  members,
}: MemberListProps) {
  return (
    <section>
      <h1>{organizationName} members</h1>

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.userId}>
              <strong>{member.name}</strong>
              <span> — {member.email} ({member.role})</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
