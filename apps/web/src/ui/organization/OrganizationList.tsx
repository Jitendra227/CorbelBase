import Link from "next/link";

import { PATHS } from "@/config/paths";
import type { Organization } from "@/lib/organizations/service";
import CreateOrganizationForm from "./CreateOrganizationForm";

import styles from "./styles/organizationList.module.scss";

interface OrganizationListProps {
  userName: string;
  organizations: Organization[];
}

export default function OrganizationList({
  userName,
  organizations,
}: OrganizationListProps) {
  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Organizations</h1>
        <p>Welcome, {userName}. Manage your engineering teams.</p>
      </header>

      <section className={styles.createSection}>
        <h2>Create an organization</h2>
        <CreateOrganizationForm />
      </section>

      <section className={styles.organizationsSection}>
        <div className={styles.sectionHeader}>
          <h2>Your organizations</h2>
          <span>{organizations.length} total</span>
        </div>

        {organizations.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No organizations yet</h3>
            <p>Create your first organization to get started.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {organizations.map((organization) => (
              <Link
                key={organization.id}
                href={PATHS.organization(organization.id)}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.organizationIdentity}>
                    <span className={styles.organizationMark}>
                      {organization.name.charAt(0).toUpperCase()}
                    </span>

                    <div>
                      <h3>{organization.name}</h3>
                      <span className={styles.organizationLabel}>
                        Organization
                      </span>
                    </div>
                  </div>

                  <span className={styles.role}>{organization.role}</span>
                </div>

                <div className={styles.cardFooter}>
                  <span>View workspace</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
