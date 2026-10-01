import {
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations";
import { users } from "./users";

export const projectStatus = pgEnum("project_status", [
  "under_review",
  "active",
  "archived",
  "abandoned",
]);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    key: varchar("key", { length: 20 }).notNull(),
    description: varchar("description", { length: 500 }),
    status: projectStatus("status").notNull().default("under_review"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("projects_organization_key_unique").on(
      table.organizationId,
      table.key
    ),
  ]
);
