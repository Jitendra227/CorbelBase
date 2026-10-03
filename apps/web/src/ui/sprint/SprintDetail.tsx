import type { Sprint } from "@/lib/sprints/service";

interface SprintDetailProps {
  sprint: Sprint;
}

export default function SprintDetail({ sprint }: SprintDetailProps) {
  return (
    <section>
      <h1>{sprint.name}</h1>
      <p>Status: {sprint.status}</p>
      {sprint.goal ? <p>{sprint.goal}</p> : null}
    </section>
  );
}
