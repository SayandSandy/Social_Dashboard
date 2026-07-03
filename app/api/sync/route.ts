import { NextResponse } from 'next/server';
import { SyncService } from '../../../services/sync.service';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

    const { db } = await import('../../../db');
    const { users } = await import('../../../db/schema');
    let usersToSync = [];

    if (isCron) {
      usersToSync = await db.select().from(users);
    } else {
      const { createClient } = await import('../../../lib/supabase/server');
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const dbUsers = await db.select().from(users).where(eq(users.id, user.id));
      usersToSync = dbUsers;
    }

    const results = [];
    for (const user of usersToSync) {
      if (!user.igAccessToken || !user.igBusinessAccountId) continue;

      const syncService = new SyncService(user.id, user.igAccessToken, user.igBusinessAccountId);
      try {
        const result = await syncService.runDailySync();
        results.push({ accountId: user.id, result });
      } catch (e) {
        console.error(`Sync failed for user ${user.id}`, e);
        results.push({ accountId: user.id, status: 'failed' });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    );
  }
}
