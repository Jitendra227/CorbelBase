import { pgEnum, pgTable, uuid, timestamp, unique } from "drizzle-orm/pg-core";

import { users } from "./users";
import { organizations } from "./organizations";

export const organizationRole = pgEnum("organization_role", [
  "owner",
  "admin",
  "developer",
  "viewer",
]);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: organizationRole("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("memberships_user_organization_unique").on(
      table.userId,
      table.organizationId
    ),
  ]
);
