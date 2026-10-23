"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

import { createOrganization } from "@/lib/organizations/organizationService";

export default function CreateOrganizationForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createOrganization(name.trim());
      setName("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create organization."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="organization-name">Organization name</label>
      <input
        id="organization-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={100}
        required
        disabled={isSubmitting}
        placeholder="e.g. Engineering Team"
      />

      <button type="submit" disabled={isSubmitting || !name.trim()}>
        {isSubmitting ? "Creating..." : "Create organization"}
      </button>

      {error && <p role="alert">{error}</p>}
    </form>
  );
}
