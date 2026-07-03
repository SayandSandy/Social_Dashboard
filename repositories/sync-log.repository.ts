import { desc } from 'drizzle-orm';
import { db } from '../db';
import { igSyncLog } from '../db/schema';

export class SyncLogRepository {
  async insert(data: typeof igSyncLog.$inferInsert) {
    return db.insert(igSyncLog).values(data).returning();
  }

  async update(id: string, data: Partial<typeof igSyncLog.$inferInsert>) {
    return db.update(igSyncLog).set(data).where(eq(igSyncLog.id, id));
  }

  async getLatestSync(accountId: string) {
    const result = await db.select()
      .from(igSyncLog)
      .where(eq(igSyncLog.accountId, accountId))
      .orderBy(desc(igSyncLog.startedAt))
      .limit(1);
    return result[0];
  }
}

// Add eq import
import { eq } from 'drizzle-orm';
