import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { tasks } from "./tasks";
import { users } from "./users";

export const taskComments = pgTable("task_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
