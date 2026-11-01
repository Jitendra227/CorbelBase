import Link from "next/link";

import { PATHS } from "@/config/paths";

import styles from "./shell.module.scss";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <Link href={PATHS.organizations} className={styles.brand}>
        <span className={styles.brandMark}>C</span>
        <span>CorbelBase</span>
      </Link>

      <div className={styles.navSection}>
        <p className={styles.navLabel}>WORKSPACE</p>

        <nav className={styles.navigation}>
          <Link className={styles.link} href={PATHS.organizations}>
            <span className={styles.navIcon}>▦</span>
            Organizations
          </Link>
        </nav>
      </div>

      <div className={styles.sidebarFooter}>Engineering workspace</div>
    </aside>
  );
}
