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

  private async fetchRapidAPI(endpoint: string, params: Record<string, any>, method: 'GET' | 'POST' = 'GET') {
    const host = 'instagram-scraper-stable-api.p.rapidapi.com';
    let url = `https://${host}/${endpoint}`;
    
    let options: RequestInit = {
      method,
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
        'x-rapidapi-host': host,
      }
    };

    if (method === 'GET') {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => searchParams.append(key, String(params[key])));
      url += `?${searchParams.toString()}`;
    } else {
      (options.headers as any)['Content-Type'] = 'application/json';
      options.body = JSON.stringify(params);
    }
    
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`RapidAPI Error: ${res.status} ${res.statusText}`);
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
      // NOTE: Update the endpoint name here if it differs in your RapidAPI Snippet!
      // Often parameters are named 'username', 'user', or 'username_or_url'.
      const profileData = await this.fetchRapidAPI('ig_get_ib_profile_hover_php', { username: this.igUsername }, 'GET');
      const user = profileData.user_data;

      if (!user) throw new Error("Could not parse user_data from API");

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
        views: null, // Private metric
        reach: null, // Private metric
        accountsEngaged: null, // Private metric
        profileActivity: null, // Private metric
        websiteClicks: null, // Private metric
      } as any);

      let rowsUpserted = 1;

      // 2. Fetch Latest Posts with Likes & Comments
      // NOTE: Update the endpoint name here if it differs!
      const postsData = await this.fetchRapidAPI('user_posts', { username: this.igUsername }, 'POST');
      const posts = postsData.posts || [];

      for (const item of posts) {
        const node = item.node;
        const mediaType = node.media_type === 1 ? 'IMAGE' : node.media_type === 2 ? 'VIDEO' : 'CAROUSEL_ALBUM';
        const timestamp = new Date((node.taken_at || 0) * 1000);
        
        // Upsert media base data
        await this.contentRepo.upsertContent({
          accountId: this.accountId,
          igMediaId: node.id,
          mediaType: mediaType,
          caption: node.caption?.text || '',
          permalink: `https://instagram.com/p/${node.code}`,
          thumbnailUrl: node.image_versions2?.candidates?.[0]?.url || '',
          timestamp: timestamp,
          likeCount: node.like_count || 0,
          commentsCount: node.comment_count || 0,
          views: node.view_count || null,
          isStory: false,
          syncedAt: new Date()
        });

        // Upsert Snapshot
        await this.contentRepo.upsertSnapshot({
          accountId: this.accountId,
          igMediaId: node.id,
          snapshotDate: dateStr,
          likeCount: node.like_count || 0,
          commentsCount: node.comment_count || 0,
          views: node.view_count || null,
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
