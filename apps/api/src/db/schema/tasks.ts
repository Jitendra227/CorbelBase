import {
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { projects } from "./projects";
import { users } from "./users";

export const taskType = pgEnum("task_type", [
  "feature",
  "bug",
  "chore",
  "improvement",
  "incident",
  "task",
]);

export const taskStatus = pgEnum("task_status", [
  "in_review",
  "in_progress",
  "test_ready",
  "testing",
  "done",
  "closed",
  "abandoned",
  "reopened",
]);

export const taskPriority = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    key: varchar("key", { length: 30 }).notNull(),
    type: taskType("type").notNull().default("task"),
    title: varchar("title", { length: 200 }).notNull(),
    description: varchar("description", { length: 2000 }),
    status: taskStatus("status").notNull().default("in_review"),
    priority: taskPriority("priority").notNull().default("medium"),
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("tasks_project_number_unique").on(table.projectId, table.number),
    unique("tasks_project_key_unique").on(table.projectId, table.key),
  ]
);
