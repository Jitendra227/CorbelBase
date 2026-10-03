import Link from "next/link";

import { PATHS } from "@/config/paths";
import type { Project } from "@/lib/projects/service";

interface ProjectListProps {
  organizationId: string;
  projects: Project[];
}

export default function ProjectList({
  organizationId,
  projects,
}: ProjectListProps) {
  return (
    <section>
      <h1>Projects</h1>

      {projects.length === 0 ? (
        <p>No projects in this organization yet.</p>
      ) : (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link href={PATHS.project(organizationId, project.id)}>
                <strong>{project.key}</strong> {project.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
