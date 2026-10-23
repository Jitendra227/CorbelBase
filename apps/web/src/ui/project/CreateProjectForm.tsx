"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/lib/projects/projectService";

interface CreateProjectFormProps {
  organizationId: string;
}

export default function CreateProjectForm({
  organizationId,
}: CreateProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createProject(
        organizationId,
        name.trim(),
        key.trim().toUpperCase(),
        description.trim() || undefined
      );
      setName("");
      setKey("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create project</h2>

      <label htmlFor="project-name">Project name</label>
      <input
        id="project-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        minLength={2}
        maxLength={100}
        required
      />

      <label htmlFor="project-key">Project key</label>
      <input
        id="project-key"
        value={key}
        onChange={(event) => setKey(event.target.value.toUpperCase())}
        minLength={2}
        maxLength={10}
        pattern="[A-Z][A-Z0-9]*"
        title="Start with a letter; use only uppercase letters and numbers."
        required
      />

      <label htmlFor="project-description">Description (optional)</label>
      <textarea
        id="project-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={500}
        rows={3}
      />

      {error && <p role="alert">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || !name.trim() || !key.trim()}
      >
        {isSubmitting ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
