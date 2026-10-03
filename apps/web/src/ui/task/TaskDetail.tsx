import type { Task, TaskComment } from "@/lib/tasks/service";

interface TaskDetailProps {
  task: Task;
  comments: TaskComment[];
}

export default function TaskDetail({ task, comments }: TaskDetailProps) {
  return (
    <section>
      <h1>
        {task.key} — {task.title}
      </h1>
      <p>
        {task.type} · {task.status} · {task.priority}
      </p>
      {task.description ? <p>{task.description}</p> : null}

      <h2>Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>{comment.content}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
