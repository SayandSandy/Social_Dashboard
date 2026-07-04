import { OverviewRepository } from '../repositories/overview.repository';
import { ContentRepository } from '../repositories/content.repository';
import { SyncLogRepository } from '../repositories/sync-log.repository';
import { GoogleSheetsService } from './google-sheets.service';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

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
      (options.headers as any)['Content-Type'] = 'application/x-www-form-urlencoded';
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => searchParams.append(key, String(params[key])));
      options.body = searchParams.toString();
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
      // Using RockSolid API endpoints:
      const profileData = await this.fetchRapidAPI('ig_get_fb_profile.php', { username_or_url: this.igUsername, data: 'basic' }, 'POST');
      const user = profileData;

      if (!user || !user.pk) throw new Error("Could not parse user data from API");

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
      // Using RockSolid API endpoints:
      const postsData = await this.fetchRapidAPI('get_ig_user_posts.php', { username_or_url: this.igUsername, amount: '12' }, 'POST');
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

      // Push to Google Sheets if configured
      const userList = await db.select().from(users).where(eq(users.id, this.accountId));
      if (userList.length > 0 && userList[0].googleSheetId) {
        try {
          const sheetsService = new GoogleSheetsService(userList[0].googleSheetId);
          
          await sheetsService.appendOverview({
            followerCount: user.follower_count,
            mediaCount: user.media_count,
            // RapidAPI missing fields are sent as 0 to maintain column structure
            totalViews: 0,
            totalInteractions: 0,
            profileViews: 0
          });

          // Fetch recent posts to sync
          const recentPosts = await this.contentRepo.getRecentContent(this.accountId, 20);
          await sheetsService.updatePosts(recentPosts);
        } catch (sheetErr) {
          console.error('Failed to sync to Google Sheets:', sheetErr);
        }
      }

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
