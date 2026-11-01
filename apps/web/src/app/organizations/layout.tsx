import type { ReactNode } from "react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import Sidebar from "@/ui/navigation/Sidebar";
import WorkspaceHeader from "@/ui/navigation/WorkspaceHeader";
import styles from "@/ui/navigation/shell.module.scss";

export default async function OrganizationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className={styles.shell}>
      <Sidebar />

      <main className={styles.content}>
        <WorkspaceHeader userName={user.name} />

        <div className={styles.pageContent}>{children}</div>
      </main>
    </div>
  );
}
