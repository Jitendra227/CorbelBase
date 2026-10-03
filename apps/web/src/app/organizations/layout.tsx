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
      <main className={styles.content}>{children}</main>
    </div>
  );
}
