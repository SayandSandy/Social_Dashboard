export interface DerivedMetrics {
  engagementRate: number; // (likes + comments + saves + shares) / reach
  reachRate: number; // reach / followers_count
  saveRate: number; // saves / reach
  shareRate: number; // shares / reach
  followerGrowthPct: number; // (current - previous) / previous * 100
  avgDailyReach: number;
  avgDailyViews: number;
  monthOverMonthChange: Record<string, number>;
  rollingAvg7d: Record<string, number>;
  rollingAvg30d: Record<string, number>;
  topContent: any[]; // top 5 by engagement rate
  worstContent: any[];
  medianEngagement: number;
  stdDevEngagement: number;
  outliers: any[]; // > 2σ from mean
}
