import { NextResponse } from 'next/server';
import { SyncService } from '../../../../services/sync.service';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await import('../../../../db');
    const { users } = await import('../../../../db/schema');
    const allUsers = await db.select().from(users);
    
    const results = [];

    for (const user of allUsers) {
      if (!user.igUsername) continue;

      const syncService = new SyncService(user.id, user.igUsername);
      try {
        const result = await syncService.runDailySync();
        results.push({ accountId: user.id, result });
      } catch (e) {
        console.error(`Sync failed for user ${user.id}`, e);
        results.push({ accountId: user.id, status: 'failed' });
      }
    }

    return NextResponse.json({ success: true, processed: results.length });
  } catch (error: any) {
    console.error('Daily cron sync error:', error);
    // Return 200 even on failure to prevent Vercel from spam-retrying
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 200 }
    );
  }
}
