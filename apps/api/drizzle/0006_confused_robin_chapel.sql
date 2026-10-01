ALTER TABLE "tasks" DROP CONSTRAINT "tasks_key_unique";--> statement-breakpoint

UPDATE "tasks" AS t
SET "key" = p."key" || '-' || t."number"
FROM "projects" AS p
WHERE t."project_id" = p."id";--> statement-breakpoint

ALTER TABLE "tasks" ALTER COLUMN "key" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_key_unique"
UNIQUE("project_id","key");