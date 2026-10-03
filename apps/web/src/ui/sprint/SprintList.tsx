import Link from "next/link";

import { PATHS } from "@/config/paths";
import type { Sprint } from "@/lib/sprints/service";

interface SprintListProps {
  organizationId: string;
  projectId: string;
  sprints: Sprint[];
}

export default function SprintList({
  organizationId,
  projectId,
  sprints,
}: SprintListProps) {
  return (
    <section>
      <h1>Sprints</h1>

      {sprints.length === 0 ? (
        <p>No sprints in this project yet.</p>
      ) : (
        <ul>
          {sprints.map((sprint) => (
            <li key={sprint.id}>
              <Link href={PATHS.sprint(organizationId, projectId, sprint.id)}>
                <strong>{sprint.name}</strong>
              </Link>
              <span> — {sprint.status}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
