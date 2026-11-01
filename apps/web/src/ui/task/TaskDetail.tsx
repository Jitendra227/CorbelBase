"use client";

import { useState } from "react";
import type { Task, TaskComment } from "@/lib/tasks/service";
import { useRouter } from "next/navigation";
import {
  createTaskComment,
  updateTask,
  updateTaskComment,
  deleteTaskComment,
} from "@/lib/tasks/taskService";
import { Sprint } from "@/lib/sprints/service";

interface TaskDetailProps {
  organizationId: string;
  task: Task;
  comments: TaskComment[];
  currentUserId: string;
  organizationRole: "owner" | "admin" | "developer" | "viewer";
  sprints: Sprint[];
}

const statuses = [
  "in_review",
  "in_progress",
  "test_ready",
  "testing",
  "done",
  "closed",
  "abandoned",
  "reopened",
] as const;

const priorities = ["low", "medium", "high", "critical"] as const;

export default function TaskDetail({
  organizationId,
  task,
  comments,
  currentUserId,
  organizationRole,
  sprints,
}: TaskDetailProps) {
  const [status, setStatus] = useState<(typeof statuses)[number]>(
    task.status as (typeof statuses)[number]
  );
  const [priority, setPriority] = useState<(typeof priorities)[number]>(
    task.priority as (typeof priorities)[number]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [commentContent, setCommentContent] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentActionError, setCommentActionError] = useState("");
  const [sprintId, setSprintId] = useState(task.sprintId ?? "");

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      await updateTask(organizationId, task.projectId, task.id, {
        status,
        priority,
        sprintId: sprintId || null,
      });
      setMessage("Task updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to update task."
      );
    } finally {
      setSaving(false);
    }
  }
  async function handleAddComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = commentContent.trim();

    if (!content) return;

    setCommentSaving(true);
    setCommentError("");

    try {
      await createTaskComment(organizationId, task.projectId, task.id, content);

      setCommentContent("");
      router.refresh();
    } catch (error) {
      setCommentError(
        error instanceof Error ? error.message : "Failed to add comment."
      );
    } finally {
      setCommentSaving(false);
    }
  }

  async function handleUpdateComment(commentId: string) {
    const content = editingContent.trim();
    if (!content) return;

    setCommentActionError("");

    try {
      await updateTaskComment(
        organizationId,
        task.projectId,
        task.id,
        commentId,
        content
      );

      setEditingCommentId(null);
      setEditingContent("");
      router.refresh();
    } catch (error) {
      setCommentActionError(
        error instanceof Error ? error.message : "Failed to edit comment."
      );
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!window.confirm("Delete this comment?")) return;

    setCommentActionError("");

    try {
      await deleteTaskComment(
        organizationId,
        task.projectId,
        task.id,
        commentId
      );

      router.refresh();
    } catch (error) {
      setCommentActionError(
        error instanceof Error ? error.message : "Failed to delete comment."
      );
    }
  }

  return (
    <section>
      <h1>
        {task.key} — {task.title}
      </h1>

      <p>{task.type}</p>

      <div>
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as (typeof statuses)[number])
          }
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="task-priority">Priority</label>
        <select
          id="task-priority"
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as (typeof priorities)[number])
          }
        >
          {priorities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="task-sprint">Sprint</label>

        <select
          id="task-sprint"
          value={sprintId}
          onChange={(event) => setSprintId(event.target.value)}
        >
          <option value="">No sprint</option>

          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name} ({sprint.status})
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={
          saving ||
          (status === task.status &&
            priority === task.priority &&
            sprintId === (task.sprintId ?? ""))
        }
      >
        {saving ? "Saving..." : "Save changes"}
      </button>

      {message && <p role="status">{message}</p>}

      {task.description ? <p>{task.description}</p> : null}

      <h2>Comments</h2>

      {commentActionError && <p role="alert">{commentActionError}</p>}

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              {editingCommentId === comment.id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(event) => setEditingContent(event.target.value)}
                    maxLength={2000}
                    required
                  />
                  <button
                    type="button"
                    disabled={!editingContent.trim()}
                    onClick={() => handleUpdateComment(comment.id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditingContent("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <div>
                    <strong>{comment.authorName}</strong>
                    <small>
                      {" "}
                      · {new Date(comment.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <p>
                    {comment.content}
                    {comment.isEdited && <small> (edited)</small>}
                  </p>

                  {comment.userId === currentUserId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingContent(comment.content);
                      }}
                    >
                      Edit
                    </button>
                  )}

                  {(comment.userId === currentUserId ||
                    organizationRole === "owner" ||
                    organizationRole === "admin") && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleAddComment}>
        <label htmlFor="comment-content">Add a comment</label>
        <textarea
          id="comment-content"
          value={commentContent}
          onChange={(event) => setCommentContent(event.target.value)}
          maxLength={2000}
          rows={3}
          required
        />

        {commentError && <p role="alert">{commentError}</p>}

        <button
          type="submit"
          disabled={commentSaving || !commentContent.trim()}
        >
          {commentSaving ? "Posting..." : "Post comment"}
        </button>
      </form>
    </section>
  );
}
