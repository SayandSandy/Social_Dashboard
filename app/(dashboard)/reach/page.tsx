import { AnalyticsService } from '../../../services/analytics.service';
import { ReachChart } from '../../../components/charts/ReachChart';
import { StatCard } from '../../../components/cards/StatCard';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ReachPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const analyticsService = new AnalyticsService(user.id);
  
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90); 
  
  const rawData = await analyticsService.getDashboardData(start, end);
  
  const chartData = rawData
    .map(d => ({ date: d.date, reach: d.reach || 0 }))
    .reverse(); 

  const totalReach = chartData.reduce((sum, item) => sum + item.reach, 0);
  const avgReach = chartData.length > 0 ? Math.round(totalReach / chartData.length) : 0;
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reach Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Reach (90d)" value={totalReach.toLocaleString()} />
        <StatCard title="Average Daily Reach (90d)" value={avgReach.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chartData.length > 0 ? (
          <ReachChart data={chartData} />
        ) : (
          <div className="text-slate-400">No reach data available.</div>
        )}
      </div>
    </div>
  );
}
