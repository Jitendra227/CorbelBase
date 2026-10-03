import Link from "next/link";

import { PATHS } from "@/config/paths";

import styles from "../navigation/shell.module.scss";

interface OrganizationNavProps {
  organizationId: string;
}

export default function OrganizationNav({
  organizationId,
}: OrganizationNavProps) {
  return (
    <nav className={styles.sectionNav}>
      <Link href={PATHS.organization(organizationId)}>Overview</Link>
      <Link href={PATHS.members(organizationId)}>Members</Link>
      <Link href={PATHS.projects(organizationId)}>Projects</Link>
    </nav>
  );
}
