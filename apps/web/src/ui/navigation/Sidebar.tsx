import Link from "next/link";

import { PATHS } from "@/config/paths";

import styles from "./shell.module.scss";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.logo}>CorbelBase</h2>

      <nav className={styles.navigation}>
        <Link className={styles.link} href={PATHS.organizations}>
          Organizations
        </Link>
      </nav>
    </aside>
  );
}
