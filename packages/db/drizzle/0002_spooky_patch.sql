ALTER TABLE "profile" DROP CONSTRAINT "profile_userId_unique";--> statement-breakpoint
ALTER TABLE "fight" ALTER COLUMN "scheduled_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
CREATE INDEX "chat_message_fight_time_idx" ON "chat_message" USING btree ("fight_id","created_at");--> statement-breakpoint
CREATE INDEX "fight_fighter1_idx" ON "fight" USING btree ("fighter1_id");--> statement-breakpoint
CREATE INDEX "fight_fighter2_idx" ON "fight" USING btree ("fighter2_id");--> statement-breakpoint
CREATE INDEX "fight_pending_judge_idx" ON "fight" USING btree ("status") WHERE "fight"."judge_id" IS NULL;--> statement-breakpoint
CREATE INDEX "swipe_target_idx" ON "swipe" USING btree ("target_id");--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_unique" UNIQUE("user_id");