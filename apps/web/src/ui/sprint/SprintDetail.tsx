"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";

import type { Sprint } from "@/lib/sprints/service";
import { completeSprint, updateSprint } from "@/lib/sprints/sprintService";
import type { Task } from "@/lib/tasks/service";
import type { SprintTaskDecision } from "@/lib/sprints/sprintService";
import { updateTask } from "@/lib/tasks/taskService";

interface SprintDetailProps {
  sprint: Sprint;
  tasks: Task[];
  unassignedTasks: Task[];
  sprints: Sprint[];
  organizationId: string;
  projectId: string;
}

type TaskDecision =
  | { action: "close" }
  | { action: "rollover"; destinationSprintId: string };

export default function SprintDetail({
  sprint,
  tasks,
  organizationId,
  projectId,
  unassignedTasks,
  sprints,
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

  const [decisions, setDecisions] = useState<Record<string, TaskDecision>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState("");

  const unfinishedTasks = tasks.filter(
    (task) => task.status !== "done" && task.status !== "closed"
  );

  const destinationSprints = sprints.filter(
    (item) =>
      item.id !== sprint.id &&
      (item.status === "planned" || item.status === "active")
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "done" || task.status === "closed"
  ).length;

  const totalTasks = tasks.length;

  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const statusCounts = [
    { label: "To do", statuses: ["reopened"] },
    { label: "In progress", statuses: ["in_progress"] },
    { label: "In review", statuses: ["in_review"] },
    { label: "Testing", statuses: ["test_ready", "testing"] },
    { label: "Completed", statuses: ["done", "closed"] },
    { label: "Abandoned", statuses: ["abandoned"] },
  ].map(({ label, statuses }) => ({
    label,
    count: tasks.filter((task) => statuses.includes(task.status)).length,
  }));

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

  async function handleCompleteSprint() {
    setCompletionError("");

    const missingDecision = unfinishedTasks.some((task) => {
      const decision = decisions[task.id];

      return (
        !decision ||
        (decision.action === "rollover" && !decision.destinationSprintId)
      );
    });

    if (missingDecision) {
      setCompletionError("Choose an action for every unfinished task.");
      return;
    }

    const payload: SprintTaskDecision[] = unfinishedTasks.map((task) => {
      const decision = decisions[task.id];

      if (decision.action === "close") {
        return {
          taskId: task.id,
          action: "close",
        };
      }

      return {
        taskId: task.id,
        action: "rollover",
        destinationSprintId: decision.destinationSprintId,
      };
    });

    setIsCompleting(true);

    try {
      await completeSprint(organizationId, projectId, sprint.id, payload);

      router.refresh();
    } catch (err) {
      setCompletionError(
        err instanceof Error ? err.message : "Failed to complete sprint."
      );
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <section>
      <h1>{sprint.name}</h1>

      <section>
        <h2>Sprint progress</h2>

        <p>
          {completedTasks} of {totalTasks} tasks completed
        </p>

        <progress
          value={completionPercentage}
          max={100}
          aria-label="Sprint completion"
        />

        <p>{completionPercentage}% complete</p>

        <ul>
          {statusCounts.map(({ label, count }) => (
            <li key={label}>
              {label}: {count}
            </li>
          ))}
        </ul>
      </section>

      {sprint.status === "active" && (
        <section>
          <h2>Complete sprint</h2>

          <p>{unfinishedTasks.length} unfinished tasks need a decision.</p>

          {unfinishedTasks.length > 0 && (
            <ul>
              {unfinishedTasks.map((task) => {
                const decision = decisions[task.id];

                return (
                  <li key={task.id}>
                    <strong>{task.key}</strong> — {task.title}
                    <div>
                      <label htmlFor={`decision-${task.id}`}>Action</label>

                      <select
                        id={`decision-${task.id}`}
                        value={decision?.action ?? ""}
                        onChange={(event) => {
                          const action = event.target.value;

                          setDecisions((current) => {
                            const next = { ...current };

                            if (action === "close") {
                              next[task.id] = { action: "close" };
                            } else if (action === "rollover") {
                              next[task.id] = {
                                action: "rollover",
                                destinationSprintId: "",
                              };
                            } else {
                              delete next[task.id];
                            }

                            return next;
                          });
                        }}
                      >
                        <option value="">Choose action</option>
                        <option value="close">Close task</option>
                        <option
                          value="rollover"
                          disabled={destinationSprints.length === 0}
                        >
                          Roll over
                        </option>
                      </select>

                      {decision?.action === "rollover" && (
                        <>
                          <label htmlFor={`destination-${task.id}`}>
                            Destination sprint
                          </label>

                          <select
                            id={`destination-${task.id}`}
                            value={decision.destinationSprintId}
                            onChange={(event) => {
                              setDecisions((current) => ({
                                ...current,
                                [task.id]: {
                                  action: "rollover",
                                  destinationSprintId: event.target.value,
                                },
                              }));
                            }}
                          >
                            <option value="">Choose destination</option>

                            {destinationSprints.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.status})
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {completionError && <p role="alert">{completionError}</p>}

          <button
            type="button"
            onClick={handleCompleteSprint}
            disabled={
              isCompleting ||
              (unfinishedTasks.length > 0 &&
                destinationSprints.length === 0 &&
                unfinishedTasks.some(
                  (task) => decisions[task.id]?.action === "rollover"
                ))
            }
          >
            {isCompleting ? "Completing..." : "Complete Sprint"}
          </button>
        </section>
      )}

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
          <option value="completed" disabled>
            Completed (use Complete Sprint)
          </option>
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
                {task.rolledOverFromSprintId && (
                  <span
                    style={{
                      marginLeft: "8px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: "#fff3cd",
                      color: "#856404",
                      fontSize: "12px",
                    }}
                  >
                    Rolled over
                  </span>
                )}
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
