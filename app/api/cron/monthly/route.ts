import { NextResponse } from 'next/server';
import { AIInsightsService } from '../../../../services/ai-insights.service';
import { AnalyticsService } from '../../../../services/analytics.service';
import { ContentRepository } from '../../../../repositories/content.repository';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentRepo = new ContentRepository();

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1); // Last month

    const { db } = await import('../../../../db');
    const { users } = await import('../../../../db/schema');
    const allUsers = await db.select().from(users);
    
    const results = [];

    for (const user of allUsers) {
      if (!user.igAccessToken || !user.igBusinessAccountId) continue;
      if (!user.aiProvider || !user.aiApiKey) continue; // Requires AI settings now

      const analyticsService = new AnalyticsService(user.id);
      const aiService = new AIInsightsService(user.aiProvider, user.aiApiKey, user.aiBaseUrl, user.aiModel);
      const accountData = await analyticsService.getDashboardData(start, end);
      const mediaData = await contentRepo.getAllContent(user.id); 

      const result = await aiService.generateMonthlyInsights(user.id, start, end, accountData, mediaData.slice(0, 50)); 
      results.push({ accountId: user.id, status: 'success' });
    }

    return NextResponse.json({ success: true, processed: results.length });
  } catch (error: any) {
    console.error('Monthly cron AI insights error:', error);
    return NextResponse.json(
      { error: 'Insights generation failed', details: error.message },
      { status: 200 }
    );
  }
}
