import { AnalyticsService } from '../../../services/analytics.service';
import { ViewsChart } from '../../../components/charts/ViewsChart';
import { StatCard } from '../../../components/cards/StatCard';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ViewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const analyticsService = new AnalyticsService(user.id);
  
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90); // Last 90 days for trends
  
  const rawData = await analyticsService.getDashboardData(start, end);
  
  const chartData = rawData
    .map(d => ({ date: d.date, views: d.views || 0 }))
    .reverse(); // Chronological for chart

  const totalViews = chartData.reduce((sum, item) => sum + item.views, 0);
  const avgViews = chartData.length > 0 ? Math.round(totalViews / chartData.length) : 0;
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Views Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Views (90d)" value={totalViews.toLocaleString()} />
        <StatCard title="Average Daily Views (90d)" value={avgViews.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chartData.length > 0 ? (
          <ViewsChart data={chartData} />
        ) : (
          <div className="text-slate-400">No view data available.</div>
        )}
      </div>
    </div>
  );
}
