"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

import type { Sprint } from "@/lib/sprints/service";
import { updateSprint } from "@/lib/sprints/sprintService";
import type { Task } from "@/lib/tasks/service";
import { updateTask } from "@/lib/tasks/taskService";

interface SprintDetailProps {
  sprint: Sprint;
  tasks: Task[];
  unassignedTasks: Task[];
  organizationId: string;
  projectId: string;
}

export default function SprintDetail({
  sprint,
  tasks,
  organizationId,
  projectId,
  unassignedTasks,
}: SprintDetailProps) {
  const router = useRouter();

  const [name, setName] = useState(sprint.name);
  const [goal, setGoal] = useState(sprint.goal ?? "");
  const [status, setStatus] = useState(sprint.status);
  const [startDate, setStartDate] = useState(
    sprint.startDate?.slice(0, 10) ?? ""
  );
  const [endDate, setEndDate] = useState(sprint.endDate?.slice(0, 10) ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await updateSprint(organizationId, projectId, sprint.id, {
        name: name.trim(),
        goal: goal.trim() || null,
        status,
        startDate: startDate
          ? new Date(`${startDate}T00:00:00`).toISOString()
          : null,
        endDate: endDate ? new Date(`${endDate}T00:00:00`).toISOString() : null,
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update sprint.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAssignTasks() {
    if (selectedTaskIds.length === 0) return;

    setIsAssigning(true);
    setAssignmentError("");

    try {
      await Promise.all(
        selectedTaskIds.map((taskId) =>
          updateTask(organizationId, projectId, taskId, {
            sprintId: sprint.id,
          })
        )
      );

      setSelectedTaskIds([]);
      router.refresh();
    } catch (err) {
      setAssignmentError(
        err instanceof Error ? err.message : "Failed to assign tasks."
      );
      router.refresh();
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <section>
      <h1>{sprint.name}</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="sprint-name">Sprint name</label>
        <input
          id="sprint-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
        />

        <label htmlFor="sprint-goal">Goal</label>
        <textarea
          id="sprint-goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          maxLength={500}
          rows={3}
        />

        <label htmlFor="sprint-status">Status</label>
        <select
          id="sprint-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as Sprint["status"])
          }
        >
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <label htmlFor="sprint-start">Start date</label>
        <input
          id="sprint-start"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />

        <label htmlFor="sprint-end">End date</label>
        <input
          id="sprint-end"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={isSaving || name.trim().length < 2}>
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <section>
        <h2>Tasks in this sprint ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <p>No tasks assigned to this sprint yet.</p>
        ) : (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <strong>{task.key}</strong> — {task.title}
                <span> | {task.status}</span>
                <span> | {task.priority}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Unassigned tasks ({unassignedTasks.length})</h2>

        {unassignedTasks.length === 0 ? (
          <p>All project tasks are assigned to a sprint.</p>
        ) : (
          <>
            <ul>
              {unassignedTasks.map((task) => (
                <li key={task.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.includes(task.id)}
                      onChange={(event) => {
                        setSelectedTaskIds((current) =>
                          event.target.checked
                            ? [...current, task.id]
                            : current.filter((id) => id !== task.id)
                        );
                      }}
                    />
                    <strong>{task.key}</strong> — {task.title}
                    <span> | {task.priority}</span>
                  </label>
                </li>
              ))}
            </ul>

            {assignmentError && <p role="alert">{assignmentError}</p>}

            <button
              type="button"
              onClick={handleAssignTasks}
              disabled={isAssigning || selectedTaskIds.length === 0}
            >
              {isAssigning
                ? "Adding tasks..."
                : `Add ${selectedTaskIds.length} tasks to sprint`}
            </button>
          </>
        )}
      </section>
    </section>
  );
}
