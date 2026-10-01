ALTER TABLE "tasks" ADD COLUMN "key" varchar(30);--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_key_unique" UNIQUE("key");