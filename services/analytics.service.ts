import { OverviewRepository } from '../repositories/overview.repository';
import { addDays, format } from 'date-fns';

export class AnalyticsService {
  private overviewRepo = new OverviewRepository();
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async getDashboardData(start: Date, end: Date) {
    const data = await this.overviewRepo.getByDateRange(this.accountId, start, end);
    return data;
  }
  
  // Future methods to aggregate data for different views
}
