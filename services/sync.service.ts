import { InstagramService } from './instagram.service';
import { OverviewRepository } from '../repositories/overview.repository';
import { ContentRepository } from '../repositories/content.repository';
import { SyncLogRepository } from '../repositories/sync-log.repository';

export class SyncService {
  private igService: InstagramService;
  private overviewRepo = new OverviewRepository();
  private contentRepo = new ContentRepository();
  private syncLogRepo = new SyncLogRepository();
  private accountId: string;

  constructor(accountId: string, token: string, businessAccountId: string) {
    this.accountId = accountId;
    this.igService = new InstagramService(token, businessAccountId);
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
      // 1. Fetch yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      const since = Math.floor(yesterday.getTime() / 1000);
      const until = Math.floor(today.getTime() / 1000);

      // Fetch overview insights
      const accountInsights = await this.igService.getAccountInsights(since, until);
      
      const metrics: Record<string, any> = { accountId: this.accountId, date: yesterday.toISOString().split('T')[0] };
      accountInsights.data.forEach(metric => {
        if (metric.values && metric.values.length > 0) {
          const val = metric.values[0].value;
          const map: Record<string, string> = {
            'views': 'views',
            'reach': 'reach',
            'accounts_engaged': 'accountsEngaged',
            'profile_activity': 'profileActivity',
            'website_clicks': 'websiteClicks',
            'follower_count': 'followersCount'
          };
          if (map[metric.name]) {
            metrics[map[metric.name]] = val;
          }
        }
      });

      await this.overviewRepo.upsert(metrics as any);

      // 2. Fetch media list and insights
      const mediaList = await this.igService.getMediaList();
      let rowsUpserted = 1; // 1 for overview

      // Promise.all with limit for rate limiting
      for (const media of mediaList) {
        // Upsert media base data
        await this.contentRepo.upsertContent({
          accountId: this.accountId,
          igMediaId: media.id,
          mediaType: media.media_type,
          caption: media.caption,
          permalink: media.permalink,
          thumbnailUrl: media.thumbnail_url,
          timestamp: new Date(media.timestamp),
          likeCount: media.like_count,
          commentsCount: media.comments_count,
          isStory: media.media_type === 'STORY',
          syncedAt: new Date()
        });

        // Get insights
        try {
          const mediaInsights = await this.igService.getMediaInsights(media.id, media.media_type);
          const snapshot: Record<string, any> = {
            accountId: this.accountId,
            igMediaId: media.id,
            snapshotDate: yesterday.toISOString().split('T')[0]
          };

          mediaInsights.data.forEach(metric => {
            if (metric.values && metric.values.length > 0) {
              const val = metric.values[0].value;
              const map: Record<string, string> = {
                'views': 'views',
                'reach': 'reach',
                'saved_count': 'savedCount',
                'shares_count': 'sharesCount',
                'total_likes': 'likeCount',
                'total_comments': 'commentsCount'
              };
              if (map[metric.name]) {
                snapshot[map[metric.name]] = val;
              }
            }
          });

          await this.contentRepo.upsertSnapshot(snapshot as any);
          rowsUpserted += 2;
        } catch (e) {
          console.error(`Failed to fetch insights for media ${media.id}`, e);
          // Continue with other media
        }
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
