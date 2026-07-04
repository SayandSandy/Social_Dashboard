import { OverviewRepository } from '../repositories/overview.repository';
import { ContentRepository } from '../repositories/content.repository';
import { SyncLogRepository } from '../repositories/sync-log.repository';

export class SyncService {
  private overviewRepo = new OverviewRepository();
  private contentRepo = new ContentRepository();
  private syncLogRepo = new SyncLogRepository();
  private accountId: string;
  private igUsername: string;

  constructor(accountId: string, igUsername: string) {
    this.accountId = accountId;
    this.igUsername = igUsername;
  }

  private async fetchRapidAPI(endpoint: string, params: Record<string, string>) {
    // We are using a standard RapidAPI Instagram Scraper here.
    // Ensure RAPIDAPI_KEY is in .env.local
    const url = new URL(`https://instagram-scraper-api2.p.rapidapi.com/v1/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const res = await fetch(url.toString(), {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com'
      }
    });
    if (!res.ok) throw new Error(`RapidAPI Error: ${res.statusText}`);
    return res.json();
  }

  async runDailySync() {
    const startedAt = new Date();
    const logEntry = await this.syncLogRepo.insert({
      accountId: this.accountId,
      syncType: 'daily',
      status: 'running',
      startedAt
    });
    const logId = logEntry[0].id;

    try {
      // 1. Fetch Profile Info
      const profileData = await this.fetchRapidAPI('info', { username_or_id_or_url: this.igUsername });
      const user = profileData.data;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      // Upsert Overview
      await this.overviewRepo.upsert({
        accountId: this.accountId,
        date: dateStr,
        followersCount: user.follower_count,
        followingCount: user.following_count,
        mediaCount: user.media_count,
        // The following are not available in unofficial APIs, so we leave them null
        views: null,
        reach: null,
        accountsEngaged: null,
        profileActivity: null,
        websiteClicks: null,
      } as any);

      let rowsUpserted = 1;

      // 2. Fetch Latest Posts
      const postsData = await this.fetchRapidAPI('posts', { username_or_id_or_url: this.igUsername });
      const items = postsData.data?.items || [];

      for (const item of items) {
        // Upsert media base data
        await this.contentRepo.upsertContent({
          accountId: this.accountId,
          igMediaId: item.id,
          mediaType: item.media_type === 1 ? 'IMAGE' : item.media_type === 2 ? 'VIDEO' : 'CAROUSEL_ALBUM',
          caption: item.caption?.text || '',
          permalink: `https://instagram.com/p/${item.code}`,
          thumbnailUrl: item.thumbnail_url || item.image_versions2?.candidates?.[0]?.url,
          timestamp: new Date(item.taken_at * 1000),
          likeCount: item.like_count,
          commentsCount: item.comment_count,
          views: item.play_count || null,
          isStory: false,
          syncedAt: new Date()
        });

        // Upsert Snapshot
        await this.contentRepo.upsertSnapshot({
          accountId: this.accountId,
          igMediaId: item.id,
          snapshotDate: dateStr,
          likeCount: item.like_count,
          commentsCount: item.comment_count,
          views: item.play_count || null,
          reach: null, // Private metric
          savedCount: null, // Private metric
          sharesCount: null, // Private metric
        } as any);

        rowsUpserted += 2;
      }

      await this.syncLogRepo.update(logId, {
        status: 'success',
        finishedAt: new Date(),
        rowsUpserted
      });

      return { success: true, rowsUpserted };

    } catch (error: any) {
      console.error('Daily sync failed', error);
      await this.syncLogRepo.update(logId, {
        status: 'failed',
        finishedAt: new Date(),
        errorMessage: error.message || 'Unknown error'
      });
      throw error;
    }
  }
}
