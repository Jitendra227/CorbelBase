"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutGrid } from "lucide-react";

import { PATHS } from "@/config/paths";
import styles from "./shell.module.scss";

export default function Sidebar() {
  const pathname = usePathname();
  const organizationsActive = pathname === PATHS.organizations;

  return (
    <aside className={styles.sidebar}>
      <Link href={PATHS.organizations} className={styles.brand}>
        <span className={styles.brandMark}>
          <LayoutGrid size={19} strokeWidth={2.2} />
        </span>
        <span>CorbelBase</span>
      </Link>

      <div className={styles.navSection}>
        <p className={styles.navLabel}>WORKSPACE</p>

        <nav className={styles.navigation}>
          <Link
            className={`${styles.link} ${
              organizationsActive ? styles.active : ""
            }`}
            href={PATHS.organizations}
            aria-current={organizationsActive ? "page" : undefined}
          >
            <Building2 size={18} strokeWidth={1.8} />
            <span>Organizations</span>
          </Link>
        </nav>
      </div>

      <div className={styles.sidebarFooter}>Engineering workspace</div>
    </aside>
  );
}
