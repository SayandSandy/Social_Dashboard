import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { igContent, igContentSnapshots } from '../db/schema';

export class ContentRepository {
  async upsertContent(data: typeof igContent.$inferInsert) {
    return db.insert(igContent).values(data).onConflictDoUpdate({
      target: [igContent.accountId, igContent.igMediaId],
      set: data,
    });
  }

  async upsertSnapshot(data: typeof igContentSnapshots.$inferInsert) {
    return db.insert(igContentSnapshots).values(data).onConflictDoUpdate({
      target: [igContentSnapshots.accountId, igContentSnapshots.igMediaId, igContentSnapshots.snapshotDate],
      set: data,
    });
  }

  async getAllContent(accountId: string) {
    return db.select()
      .from(igContent)
      .where(eq(igContent.accountId, accountId))
      .orderBy(desc(igContent.timestamp));
  }

  async getContentById(accountId: string, id: string) {
    const result = await db.select()
      .from(igContent)
      .where(and(eq(igContent.accountId, accountId), eq(igContent.id, id)))
      .limit(1);
    return result[0];
  }
}
