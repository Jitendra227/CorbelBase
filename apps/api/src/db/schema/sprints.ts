import { pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { projects } from "./projects";

export const sprintStatus = pgEnum("sprint_status", [
  "planned",
  "active",
  "completed",
  "cancelled",
]);

export const sprints = pgTable("sprints", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  goal: varchar("goal", { length: 500 }),
  status: sprintStatus("status").notNull().default("planned"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
