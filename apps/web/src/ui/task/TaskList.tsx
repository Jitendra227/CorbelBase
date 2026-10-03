import Link from "next/link";

import { PATHS } from "@/config/paths";
import type { Task } from "@/lib/tasks/service";

interface TaskListProps {
  organizationId: string;
  projectId: string;
  tasks: Task[];
}

export default function TaskList({
  organizationId,
  projectId,
  tasks,
}: TaskListProps) {
  return (
    <section>
      <h1>Tasks</h1>

      {tasks.length === 0 ? (
        <p>No tasks in this project yet.</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={PATHS.task(organizationId, projectId, task.id)}>
                <strong>{task.key}</strong> {task.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
