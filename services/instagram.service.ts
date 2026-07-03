import { InstagramGraphClient } from '../lib/instagram/client';
import { IG_ENDPOINTS } from '../lib/instagram/endpoints';
import { InstagramAccountInsightsResponse, InstagramMedia, InstagramMediaInsightsResponse } from '../types/api.types';

export class InstagramService {
  private client: InstagramGraphClient;
  private accountId: string;

  constructor(token: string, businessAccountId: string) {
    this.client = new InstagramGraphClient(token);
    this.accountId = businessAccountId;
  }

  async getAccountInsights(since: number, until: number): Promise<InstagramAccountInsightsResponse> {
    const params = {
      metric: 'views,reach,accounts_engaged,profile_activity,website_clicks,follower_count',
      period: 'day',
      since,
      until
    };
    return this.client.get<InstagramAccountInsightsResponse>(
      IG_ENDPOINTS.accountInsights(this.accountId),
      params
    );
  }

  async getMediaList(): Promise<InstagramMedia[]> {
    const params = {
      fields: 'id,media_type,caption,permalink,thumbnail_url,timestamp,like_count,comments_count',
      limit: 50
    };
    return this.client.paginate<InstagramMedia>(
      IG_ENDPOINTS.mediaList(this.accountId),
      params
    );
  }

  async getMediaInsights(mediaId: string, mediaType: string): Promise<InstagramMediaInsightsResponse> {
    let metric = 'views,reach,saved_count,shares_count,reposts_count,total_likes,total_comments';
    if (mediaType === 'STORY') {
      metric = 'views,reach,replies';
    }

    const params = { metric };
    return this.client.get<InstagramMediaInsightsResponse>(
      IG_ENDPOINTS.mediaInsights(mediaId),
      params
    );
  }

  async refreshToken(): Promise<any> {
    const params = {
      grant_type: 'ig_refresh_token',
    };
    return this.client.get<any>(IG_ENDPOINTS.tokenRefresh, params);
  }
}
