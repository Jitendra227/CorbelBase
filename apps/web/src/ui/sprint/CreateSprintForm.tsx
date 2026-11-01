"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { createSprint } from "@/lib/sprints/sprintService";

interface CreateSprintFormProps {
  organizationId: string;
  projectId: string;
}

export default function CreateSprintForm({
  organizationId,
  projectId,
}: CreateSprintFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createSprint(organizationId, projectId, {
        name: name.trim(),
        goal: goal.trim() || undefined,
        startDate: startDate
          ? new Date(`${startDate}T00:00:00`).toISOString()
          : undefined,
        endDate: endDate
          ? new Date(`${endDate}T00:00:00`).toISOString()
          : undefined,
      });

      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sprint.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create sprint</h2>

      <label htmlFor="sprint-name">Sprint name</label>
      <input
        id="sprint-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        minLength={2}
        maxLength={100}
        required
      />

      <label htmlFor="sprint-goal">Goal (optional)</label>
      <textarea
        id="sprint-goal"
        value={goal}
        onChange={(event) => setGoal(event.target.value)}
        maxLength={500}
        rows={3}
      />

      <label htmlFor="sprint-start">Start date (optional)</label>
      <input
        id="sprint-start"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
      />

      <label htmlFor="sprint-end">End date (optional)</label>
      <input
        id="sprint-end"
        type="date"
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
      />

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={isSubmitting || name.trim().length < 2}>
        {isSubmitting ? "Creating..." : "Create sprint"}
      </button>
    </form>
  );
}
