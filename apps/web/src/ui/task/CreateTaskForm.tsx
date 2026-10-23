"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/lib/tasks/taskService";

interface CreateTaskFormProps {
  organizationId: string;
  projectId: string;
}

export default function CreateTaskForm({
  organizationId,
  projectId,
}: CreateTaskFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await createTask(organizationId, projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        type: type as
          | "feature"
          | "bug"
          | "chore"
          | "improvement"
          | "incident"
          | "task",
        priority: priority as "low" | "medium" | "high" | "critical",
      });

      setTitle("");
      setDescription("");
      setType("task");
      setPriority("medium");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create task</h2>

      <label htmlFor="task-title">Title</label>
      <input
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        minLength={2}
        maxLength={200}
        required
      />

      <label htmlFor="task-description">Description (optional)</label>
      <textarea
        id="task-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength={2000}
        rows={3}
      />

      <label htmlFor="task-type">Type</label>
      <select
        id="task-type"
        value={type}
        onChange={(event) => setType(event.target.value)}
      >
        {["task", "feature", "bug", "chore", "improvement", "incident"].map(
          (item) => (
            <option key={item} value={item}>
              {item}
            </option>
          )
        )}
      </select>

      <label htmlFor="task-priority">Priority</label>
      <select
        id="task-priority"
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
      >
        {["low", "medium", "high", "critical"].map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={saving || title.trim().length < 2}>
        {saving ? "Creating..." : "Create task"}
      </button>
    </form>
  );
}
