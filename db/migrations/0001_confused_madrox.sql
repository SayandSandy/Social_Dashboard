CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"ig_access_token" text,
	"ig_business_account_id" text,
	"ai_provider" text DEFAULT 'anthropic',
	"ai_api_key" text,
	"telegram_chat_id" text,
	"telegram_connect_code" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ig_ai_insights" DROP CONSTRAINT "ig_ai_insights_period_start_period_end_unique";--> statement-breakpoint
ALTER TABLE "ig_audience_snapshot" DROP CONSTRAINT "ig_audience_snapshot_snapshot_date_unique";--> statement-breakpoint
ALTER TABLE "ig_content" DROP CONSTRAINT "ig_content_ig_media_id_unique";--> statement-breakpoint
ALTER TABLE "ig_content_snapshots" DROP CONSTRAINT "ig_content_snapshots_ig_media_id_snapshot_date_unique";--> statement-breakpoint
ALTER TABLE "ig_daily_overview" DROP CONSTRAINT "ig_daily_overview_date_unique";--> statement-breakpoint
ALTER TABLE "ig_messages_daily" DROP CONSTRAINT "ig_messages_daily_date_unique";--> statement-breakpoint
ALTER TABLE "ig_ai_insights" ADD COLUMN "account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ig_audience_snapshot" ADD COLUMN "account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ig_content" ADD COLUMN "account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ig_content_snapshots" ADD COLUMN "account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ig_daily_overview" ADD COLUMN "account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ig_messages_daily" ADD COLUMN "account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ig_sync_log" ADD COLUMN "account_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ig_ai_insights" ADD CONSTRAINT "ig_ai_insights_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_audience_snapshot" ADD CONSTRAINT "ig_audience_snapshot_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_content" ADD CONSTRAINT "ig_content_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_content_snapshots" ADD CONSTRAINT "ig_content_snapshots_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_daily_overview" ADD CONSTRAINT "ig_daily_overview_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_messages_daily" ADD CONSTRAINT "ig_messages_daily_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_sync_log" ADD CONSTRAINT "ig_sync_log_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ig_ai_insights" ADD CONSTRAINT "ig_ai_insights_account_id_period_start_period_end_unique" UNIQUE("account_id","period_start","period_end");--> statement-breakpoint
ALTER TABLE "ig_audience_snapshot" ADD CONSTRAINT "ig_audience_snapshot_account_id_snapshot_date_unique" UNIQUE("account_id","snapshot_date");--> statement-breakpoint
ALTER TABLE "ig_content" ADD CONSTRAINT "ig_content_account_id_ig_media_id_unique" UNIQUE("account_id","ig_media_id");--> statement-breakpoint
ALTER TABLE "ig_content_snapshots" ADD CONSTRAINT "ig_content_snapshots_account_id_ig_media_id_snapshot_date_unique" UNIQUE("account_id","ig_media_id","snapshot_date");--> statement-breakpoint
ALTER TABLE "ig_daily_overview" ADD CONSTRAINT "ig_daily_overview_account_id_date_unique" UNIQUE("account_id","date");--> statement-breakpoint
ALTER TABLE "ig_messages_daily" ADD CONSTRAINT "ig_messages_daily_account_id_date_unique" UNIQUE("account_id","date");