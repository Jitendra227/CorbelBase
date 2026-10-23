"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

import { addOrganizationMember } from "@/lib/organizations/organizationService";
import type { Organization } from "@/lib/organizations/service";

interface AddOrganizationMemberFormProps {
  organizationId: string;
  currentRole: Organization["role"];
}

export default function AddOrganizationMemberForm({
  organizationId,
  currentRole,
}: AddOrganizationMemberFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "developer" | "viewer">(
    "developer"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await addOrganizationMember(organizationId, email.trim(), role);
      setEmail("");
      setSuccess("Member added successfully.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Add member</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="member-email">Email</label>
        <input
          id="member-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isSubmitting}
          placeholder="member@example.com"
        />

        <label htmlFor="member-role">Role</label>
        <select
          id="member-role"
          value={role}
          onChange={(event) =>
            setRole(event.target.value as "admin" | "developer" | "viewer")
          }
          disabled={isSubmitting}
        >
          <option value="developer">Developer</option>
          <option value="viewer">Viewer</option>
          {currentRole === "owner" && <option value="admin">Admin</option>}
        </select>

        {/* <button type="submit" disabled={Boolean(isSubmitting || !email.trim())}>
          {isSubmitting ? "Adding..." : "Add member"}
        </button> */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add member"}
        </button>

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}
      </form>
    </section>
  );
}
