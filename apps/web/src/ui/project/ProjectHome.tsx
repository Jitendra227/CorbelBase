import type { Project } from "@/lib/projects/service";

interface ProjectHomeProps {
  project: Project;
}

export default function ProjectHome({ project }: ProjectHomeProps) {
  return (
    <section>
      <h1>
        {project.key} — {project.name}
      </h1>
      <p>Status: {project.status}</p>
      {project.description ? <p>{project.description}</p> : null}
    </section>
  );
}
