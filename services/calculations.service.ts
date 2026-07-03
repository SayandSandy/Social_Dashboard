export class CalculationsService {
  static calculateEngagementRate(likes: number, comments: number, saves: number, shares: number, reach: number): number {
    if (!reach || reach === 0) return 0;
    return ((likes + comments + saves + shares) / reach) * 100;
  }

  static calculateGrowthPct(current: number, previous: number): number {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
}
