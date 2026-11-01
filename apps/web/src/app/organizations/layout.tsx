import type { ReactNode } from "react";

import Sidebar from "@/ui/navigation/Sidebar";
import styles from "@/ui/navigation/shell.module.scss";

export default function OrganizationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <Sidebar />

      <main className={styles.content}>
        <header className={styles.topbar}>
          <h1 className={styles.topbarTitle}>Workspace</h1>
          <span className={styles.topbarLabel}>
            Engineering team management
          </span>
        </header>

        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}
