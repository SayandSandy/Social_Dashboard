export interface InstagramAccountInsightsResponse {
  data: {
    name: string;
    period: string;
    values: { value: number; end_time: string }[];
    title: string;
    description: string;
    id: string;
  }[];
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' | 'STORY';
  caption?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramMediaInsightsResponse {
  data: {
    name: string;
    period: string;
    values: { value: number }[];
    title: string;
    description: string;
    id: string;
  }[];
}

export interface AudienceSnapshotResponse {
  data: {
    name: string; // 'audience_gender_age', 'audience_city', 'audience_country'
    period: string; // 'lifetime'
    values: { value: Record<string, number> }[];
  }[];
}
