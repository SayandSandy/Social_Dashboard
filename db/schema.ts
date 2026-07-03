import { pgTable, uuid, text, integer, date, timestamp, boolean, jsonb, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches Supabase Auth user ID
  email: text('email'),
  igAccessToken: text('ig_access_token'),
  igBusinessAccountId: text('ig_business_account_id'),
  aiProvider: text('ai_provider').default('anthropic'),
  aiApiKey: text('ai_api_key'),
  aiBaseUrl: text('ai_base_url'),
  aiModel: text('ai_model'),
  telegramChatId: text('telegram_chat_id'),
  telegramConnectCode: text('telegram_connect_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const igDailyOverview = pgTable('ig_daily_overview', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  followersCount: integer('followers_count'),
  followingCount: integer('following_count'),
  mediaCount: integer('media_count'),
  views: integer('views'),
  reach: integer('reach'),
  accountsEngaged: integer('accounts_engaged'),
  profileActivity: integer('profile_activity'),
  websiteClicks: integer('website_clicks'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.accountId, t.date)
]);

export const igContent = pgTable('ig_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => users.id).notNull(),
  igMediaId: text('ig_media_id').notNull(),
  mediaType: text('media_type'),
  caption: text('caption'),
  permalink: text('permalink'),
  thumbnailUrl: text('thumbnail_url'),
  timestamp: timestamp('timestamp', { withTimezone: true }),
  likeCount: integer('like_count'),
  commentsCount: integer('comments_count'),
  views: integer('views'),
  reach: integer('reach'),
  savedCount: integer('saved_count'),
  sharesCount: integer('shares_count'),
  repostsCount: integer('reposts_count'),
  isStory: boolean('is_story').default(false),
  storyExpiresAt: timestamp('story_expires_at', { withTimezone: true }),
  syncedAt: timestamp('synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.accountId, t.igMediaId)
]);

export const igContentSnapshots = pgTable('ig_content_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => users.id).notNull(),
  igMediaId: text('ig_media_id').notNull(),
  snapshotDate: date('snapshot_date').notNull(),
  likeCount: integer('like_count'),
  commentsCount: integer('comments_count'),
  views: integer('views'),
  reach: integer('reach'),
  savedCount: integer('saved_count'),
  sharesCount: integer('shares_count'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.accountId, t.igMediaId, t.snapshotDate)
]);

export const igAudienceSnapshot = pgTable('ig_audience_snapshot', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => users.id).notNull(),
  snapshotDate: date('snapshot_date').notNull(),
  ageGender: jsonb('age_gender'),
  city: jsonb('city'),
  country: jsonb('country'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.accountId, t.snapshotDate)
]);

export const igMessagesDaily = pgTable('ig_messages_daily', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => users.id).notNull(),
  date: date('date').notNull(),
  newConversations: integer('new_conversations'),
  repliedConversations: integer('replied_conversations'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.accountId, t.date)
]);

export const igAiInsights = pgTable('ig_ai_insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => users.id).notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  model: text('model'),
  promptVersion: integer('prompt_version').default(1),
  executiveSummary: text('executive_summary'),
  wins: jsonb('wins'),
  losses: jsonb('losses'),
  opportunities: jsonb('opportunities'),
  recommendations: jsonb('recommendations'),
  actionItems: jsonb('action_items'),
  postingFrequency: jsonb('posting_frequency'),
  bestContentTypes: jsonb('best_content_types'),
  bestPostingTimes: jsonb('best_posting_times'),
  growthStrategy: text('growth_strategy'),
  inputTokenCount: integer('input_token_count'),
  outputTokenCount: integer('output_token_count'),
  generatedAt: timestamp('generated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  unique().on(t.accountId, t.periodStart, t.periodEnd)
]);

export const igSyncLog = pgTable('ig_sync_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').references(() => users.id).notNull(),
  syncType: text('sync_type'),
  status: text('status'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  rowsUpserted: integer('rows_upserted'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
