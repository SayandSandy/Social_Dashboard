import { AnalyticsService } from '../../../services/analytics.service';
import { FollowersChart } from '../../../components/charts/FollowersChart';
import { StatCard } from '../../../components/cards/StatCard';
import { CalculationsService } from '../../../services/calculations.service';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function FollowersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const analyticsService = new AnalyticsService(user.id);
  
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90); 
  
  const rawData = await analyticsService.getDashboardData(start, end);
  
  const chartData = rawData
    .map(d => ({ date: d.date, followers: d.followersCount || 0 }))
    .reverse(); 

  const currentFollowers = chartData.length > 0 ? chartData[chartData.length - 1].followers : 0;
  const startFollowers = chartData.length > 0 ? chartData[0].followers : 0;
  
  const growth = currentFollowers - startFollowers;
  const growthPct = CalculationsService.calculateGrowthPct(currentFollowers, startFollowers);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Followers Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Current Followers" value={currentFollowers.toLocaleString()} />
        <StatCard title="90 Day Growth" value={`${growth > 0 ? '+' : ''}${growth.toLocaleString()}`} trend={parseFloat(growthPct.toFixed(2))} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chartData.length > 0 ? (
          <FollowersChart data={chartData} growthPct={parseFloat(growthPct.toFixed(2))} />
        ) : (
          <div className="text-slate-400">No followers data available.</div>
        )}
      </div>
    </div>
  );
}
