import { desc } from 'drizzle-orm';
import { db } from '../db';
import { igMessagesDaily } from '../db/schema';

export class MessagesRepository {
  async upsert(data: typeof igMessagesDaily.$inferInsert) {
    return db.insert(igMessagesDaily).values(data).onConflictDoUpdate({
      target: igMessagesDaily.date,
      set: data,
    });
  }

  async getAll() {
    return db.select().from(igMessagesDaily).orderBy(desc(igMessagesDaily.date));
  }
}
