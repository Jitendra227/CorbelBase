import Link from "next/link";

import { PATHS } from "@/config/paths";

import styles from "../navigation/shell.module.scss";

interface ProjectNavProps {
  organizationId: string;
  projectId: string;
}

export default function ProjectNav({
  organizationId,
  projectId,
}: ProjectNavProps) {
  return (
    <nav className={styles.sectionNav}>
      <Link href={PATHS.project(organizationId, projectId)}>Overview</Link>
      <Link href={PATHS.tasks(organizationId, projectId)}>Tasks</Link>
      <Link href={PATHS.sprints(organizationId, projectId)}>Sprints</Link>
    </nav>
  );
}
