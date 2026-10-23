"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

import type {
  Organization,
  OrganizationMember,
} from "@/lib/organizations/service";
import { removeOrganizationMember, updateOrganizationMemberRole } from "@/lib/organizations/organizationService";

interface MemberListProps {
  organizationId: string;
  organizationName: string;
  members: OrganizationMember[];
  currentRole: Organization["role"];
}

type AssignableRole = "admin" | "developer" | "viewer";

export default function MemberList({
  organizationId,
  organizationName,
  members,
  currentRole,
}: MemberListProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const canManageMembers = currentRole === "owner" || currentRole === "admin";

  async function handleRoleChange(
    event: SyntheticEvent<HTMLSelectElement>,
    userId: string
  ) {
    const role = event.currentTarget.value as AssignableRole;

    setError("");
    setUpdatingUserId(userId);

    try {
      await updateOrganizationMemberRole(organizationId, userId, role);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update member role."
      );
      router.refresh();
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleRemoveMember(userId: string, memberName: string) {
    const confirmed = window.confirm(
      `Remove ${memberName} from this organization?`
    );

    if (!confirmed) return;

    setError("");
    setUpdatingUserId(userId);

    try {
      await removeOrganizationMember(organizationId, userId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove member.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <section>
      <h1>{organizationName} members</h1>

      {error && <p role="alert">{error}</p>}

      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.userId}>
              <strong>{member.name}</strong>
              <span>
                {" "}
                — {member.email} ({member.role})
              </span>

              {canManageMembers &&
                member.role !== "owner" &&
                !(currentRole === "admin" && member.role === "admin") && (
                  <button
                    type="button"
                    disabled={updatingUserId === member.userId}
                    onClick={() =>
                      handleRemoveMember(member.userId, member.name)
                    }
                  >
                    {updatingUserId === member.userId
                      ? "Removing..."
                      : "Remove"}
                  </button>
                )}

              {updatingUserId === member.userId && <span> Saving...</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
