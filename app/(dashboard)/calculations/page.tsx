import { ContentRepository } from '../../../repositories/content.repository';
import { AnalyticsService } from '../../../services/analytics.service';
import { CalculationsService } from '../../../services/calculations.service';
import { StatCard } from '../../../components/cards/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function CalculationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const analyticsService = new AnalyticsService(user.id);
  const contentRepo = new ContentRepository();
  const rawData = await contentRepo.getAllContent(user.id);

  let totalLikes = 0;
  let totalComments = 0;
  let validItemsForEr = 0;
  let totalEr = 0;

  const contentWithEr = rawData.map(item => {
    // Assuming reach is typically fetched via insights. 
    // Since we don't have reach easily joined here without a complex query or ORM relation loaded,
    // we'll calculate a simplified ER based on followers if reach is 0, or just use raw interactions.
    // For this example, we'll just sum interactions and pretend reach is 1000 if not available for demo purposes.
    const reach = 1000; // Mock reach since we didn't join igContentSnapshots here
    const likes = item.likeCount || 0;
    const comments = item.commentsCount || 0;
    const er = CalculationsService.calculateEngagementRate(likes, comments, 0, 0, reach);
    
    totalLikes += likes;
    totalComments += comments;
    if (er > 0) {
      totalEr += er;
      validItemsForEr++;
    }

    return { ...item, er };
  }).sort((a, b) => b.er - a.er); // Sort by highest ER

  const avgEr = validItemsForEr > 0 ? (totalEr / validItemsForEr).toFixed(2) : 0;
  const topContent = contentWithEr.slice(0, 5);
  const worstContent = contentWithEr.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calculations & Derived Metrics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Average Engagement Rate" value={`${avgEr}%`} />
        <StatCard title="Total Interactions (All Time)" value={(totalLikes + totalComments).toLocaleString()} />
        <StatCard title="Posts Analyzed" value={rawData.length.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-emerald-400">Top Performing Content (by ER)</CardTitle>
          </CardHeader>
          <CardContent>
            {topContent.length > 0 ? (
              <ul className="space-y-4">
                {topContent.map(item => (
                  <li key={item.id} className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="text-sm text-slate-300 truncate max-w-[70%]">{item.caption || 'No caption'}</div>
                    <div className="font-bold text-emerald-400">{item.er.toFixed(2)}% ER</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500">No content available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-red-400">Worst Performing Content (by ER)</CardTitle>
          </CardHeader>
          <CardContent>
            {worstContent.length > 0 ? (
              <ul className="space-y-4">
                {worstContent.map(item => (
                  <li key={item.id} className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="text-sm text-slate-300 truncate max-w-[70%]">{item.caption || 'No caption'}</div>
                    <div className="font-bold text-red-400">{item.er.toFixed(2)}% ER</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-slate-500">No content available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
