ALTER TABLE "students" DROP CONSTRAINT "students_class_id_username_unique";--> statement-breakpoint
ALTER TABLE "leaderboard_entries" DROP CONSTRAINT "leaderboard_entries_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "students" DROP CONSTRAINT "students_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ALTER COLUMN "class_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "class_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_students_class_username" ON "students" USING btree ("class_id","username");