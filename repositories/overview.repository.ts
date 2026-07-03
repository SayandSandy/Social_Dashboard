import { eq, desc, gte, lte, and } from 'drizzle-orm';
import { db } from '../db';
import { igDailyOverview } from '../db/schema';

export class OverviewRepository {
  async upsert(data: typeof igDailyOverview.$inferInsert) {
    return db.insert(igDailyOverview).values(data).onConflictDoUpdate({
      target: [igDailyOverview.accountId, igDailyOverview.date],
      set: data,
    });
  }

  async getLatest(accountId: string) {
    const result = await db.select()
      .from(igDailyOverview)
      .where(eq(igDailyOverview.accountId, accountId))
      .orderBy(desc(igDailyOverview.date))
      .limit(1);
    return result[0];
  }

  async getByDateRange(accountId: string, start: Date, end: Date) {
    return db.select()
      .from(igDailyOverview)
      .where(and(
        eq(igDailyOverview.accountId, accountId),
        gte(igDailyOverview.date, start.toISOString().split('T')[0]),
        lte(igDailyOverview.date, end.toISOString().split('T')[0])
      ))
      .orderBy(desc(igDailyOverview.date));
  }
}
