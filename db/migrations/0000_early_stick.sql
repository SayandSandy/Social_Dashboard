CREATE TABLE "ig_ai_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"model" text,
	"prompt_version" integer DEFAULT 1,
	"executive_summary" text,
	"wins" jsonb,
	"losses" jsonb,
	"opportunities" jsonb,
	"recommendations" jsonb,
	"action_items" jsonb,
	"posting_frequency" jsonb,
	"best_content_types" jsonb,
	"best_posting_times" jsonb,
	"growth_strategy" text,
	"input_token_count" integer,
	"output_token_count" integer,
	"generated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ig_ai_insights_period_start_period_end_unique" UNIQUE("period_start","period_end")
);
--> statement-breakpoint
CREATE TABLE "ig_audience_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_date" date NOT NULL,
	"age_gender" jsonb,
	"city" jsonb,
	"country" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ig_audience_snapshot_snapshot_date_unique" UNIQUE("snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "ig_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ig_media_id" text NOT NULL,
	"media_type" text,
	"caption" text,
	"permalink" text,
	"thumbnail_url" text,
	"timestamp" timestamp with time zone,
	"like_count" integer,
	"comments_count" integer,
	"views" integer,
	"reach" integer,
	"saved_count" integer,
	"shares_count" integer,
	"reposts_count" integer,
	"is_story" boolean DEFAULT false,
	"story_expires_at" timestamp with time zone,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ig_content_ig_media_id_unique" UNIQUE("ig_media_id")
);
--> statement-breakpoint
CREATE TABLE "ig_content_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ig_media_id" text NOT NULL,
	"snapshot_date" date NOT NULL,
	"like_count" integer,
	"comments_count" integer,
	"views" integer,
	"reach" integer,
	"saved_count" integer,
	"shares_count" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ig_content_snapshots_ig_media_id_snapshot_date_unique" UNIQUE("ig_media_id","snapshot_date")
);
--> statement-breakpoint
CREATE TABLE "ig_daily_overview" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"followers_count" integer,
	"following_count" integer,
	"media_count" integer,
	"views" integer,
	"reach" integer,
	"accounts_engaged" integer,
	"profile_activity" integer,
	"website_clicks" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ig_daily_overview_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "ig_messages_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"new_conversations" integer,
	"replied_conversations" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "ig_messages_daily_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "ig_sync_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sync_type" text,
	"status" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"rows_upserted" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now()
);
