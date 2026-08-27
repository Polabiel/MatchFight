CREATE TYPE "public"."fight_status" AS ENUM('pending', 'scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('fighter', 'judge', 'both');--> statement-breakpoint
CREATE TYPE "public"."swipe_choice" AS ENUM('like', 'pass');--> statement-breakpoint
CREATE TYPE "public"."weight_class" AS ENUM('flyweight', 'bantamweight', 'featherweight', 'lightweight', 'welterweight', 'middleweight', 'light_heavyweight', 'heavyweight');--> statement-breakpoint
CREATE TABLE "chat_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fight_id" uuid NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fighter1_id" text NOT NULL,
	"fighter2_id" text NOT NULL,
	"judge_id" text,
	"status" "fight_status" DEFAULT 'pending' NOT NULL,
	"location" varchar(256),
	"lat" double precision,
	"lng" double precision,
	"scheduled_at" timestamp,
	"winner_id" text,
	"created_by_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"nickname" varchar(64) NOT NULL,
	"bio" text,
	"role" "role" NOT NULL,
	"weight_class" "weight_class",
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"location" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "profile_userId_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "swipe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"swiper_id" text NOT NULL,
	"target_id" text NOT NULL,
	"choice" "swipe_choice" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_fight_id_fight_id_fk" FOREIGN KEY ("fight_id") REFERENCES "public"."fight"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fight" ADD CONSTRAINT "fight_fighter1_id_user_id_fk" FOREIGN KEY ("fighter1_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fight" ADD CONSTRAINT "fight_fighter2_id_user_id_fk" FOREIGN KEY ("fighter2_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fight" ADD CONSTRAINT "fight_judge_id_user_id_fk" FOREIGN KEY ("judge_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fight" ADD CONSTRAINT "fight_winner_id_user_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fight" ADD CONSTRAINT "fight_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipe" ADD CONSTRAINT "swipe_swiper_id_user_id_fk" FOREIGN KEY ("swiper_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "swipe" ADD CONSTRAINT "swipe_target_id_user_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "swipe_unique_pair" ON "swipe" USING btree ("swiper_id","target_id");