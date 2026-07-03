import { desc, eq, and } from 'drizzle-orm';
import { db } from '../db';
import { igAiInsights } from '../db/schema';

export class InsightsRepository {
  async upsert(data: typeof igAiInsights.$inferInsert) {
    return db.insert(igAiInsights).values(data).onConflictDoUpdate({
      target: [igAiInsights.accountId, igAiInsights.periodStart, igAiInsights.periodEnd],
      set: data,
    });
  }

  async getLatest(accountId: string) {
    const result = await db.select()
      .from(igAiInsights)
      .where(eq(igAiInsights.accountId, accountId))
      .orderBy(desc(igAiInsights.periodStart))
      .limit(1);
    return result[0];
  }

  async getAll(accountId: string) {
    return db.select()
      .from(igAiInsights)
      .where(eq(igAiInsights.accountId, accountId))
      .orderBy(desc(igAiInsights.periodStart));
  }
}
