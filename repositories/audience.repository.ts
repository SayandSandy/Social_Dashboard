import { desc } from 'drizzle-orm';
import { db } from '../db';
import { igAudienceSnapshot } from '../db/schema';

export class AudienceRepository {
  async upsert(data: typeof igAudienceSnapshot.$inferInsert) {
    return db.insert(igAudienceSnapshot).values(data).onConflictDoUpdate({
      target: igAudienceSnapshot.snapshotDate,
      set: data,
    });
  }

  async getLatest() {
    const result = await db.select().from(igAudienceSnapshot).orderBy(desc(igAudienceSnapshot.snapshotDate)).limit(1);
    return result[0];
  }
}
