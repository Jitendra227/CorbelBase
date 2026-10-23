"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/projects/service";
import {
  deleteProject,
  updateProject,
  updateProjectStatus,
} from "@/lib/projects/projectService";

interface ProjectHomeProps {
  project: Project;
  canManage?: boolean;
}

const statuses: Project["status"][] = [
  "under_review",
  "active",
  "archived",
  "abandoned",
];

export default function ProjectHome({
  project,
  canManage = false,
}: ProjectHomeProps) {
  const router = useRouter();
  const [status, setStatus] = useState(project.status);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  async function handleStatusChange(nextStatus: Project["status"]) {
    setError("");
    setSaving(true);

    try {
      await updateProjectStatus(project.organizationId, project.id, nextStatus);
      setStatus(nextStatus);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update project status."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setError("");
    setSaving(true);

    try {
      await updateProject(project.organizationId, project.id, {
        name: name.trim(),
        description: description.trim(),
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete project "${project.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError("");
    setSaving(true);

    try {
      await deleteProject(project.organizationId, project.id);
      router.push(`/organizations/${project.organizationId}/projects`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h1>
        {project.key} — {project.name}
      </h1>

      <p>Status: {status.replace("_", " ")}</p>

      {canManage && (
        <>
          <label>
            Update status
            <select
              value={status}
              disabled={saving}
              onChange={(event) =>
                handleStatusChange(event.target.value as Project["status"])
              }
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          {!editing ? (
            <button type="button" onClick={() => setEditing(true)}>
              Edit project
            </button>
          ) : (
            <div>
              <label>
                Project name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Description (optional)
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </label>

              <button
                type="button"
                disabled={saving || name.trim().length < 2}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setName(project.name);
                  setDescription(project.description ?? "");
                  setEditing(false);
                  setError("");
                }}
              >
                Cancel
              </button>
              <button type="button" disabled={saving} onClick={handleDelete}>
                {saving ? "Please wait..." : "Delete project"}
              </button>
            </div>
          )}
        </>
      )}

      {error && <p role="alert">{error}</p>}
      {project.description && !editing && <p>{project.description}</p>}
    </section>
  );
}
