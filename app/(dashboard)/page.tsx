import { AnalyticsService } from '../../services/analytics.service';
import { StatCard } from '../../components/cards/StatCard';
import { CalculationsService } from '../../services/calculations.service';
import { createClient } from '../../lib/supabase/server';

// Force dynamic since we're fetching from DB which changes daily
export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const analyticsService = new AnalyticsService(user.id);
  
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30); // Last 30 days
  
  const data = await analyticsService.getDashboardData(start, end);

  // Safely get latest data
  const latest = data.length > 0 ? data[0] : null;
  const previous = data.length > 1 ? data[1] : null;

  const followersCount = latest?.followersCount || 0;
  const prevFollowersCount = previous?.followersCount || 0;
  const followerGrowth = CalculationsService.calculateGrowthPct(followersCount, prevFollowersCount);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Overview</h1>
      
      {!latest ? (
        <div className="text-slate-400">No data available. Please run a sync.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Followers" 
            value={followersCount.toLocaleString()} 
            trend={parseFloat(followerGrowth.toFixed(2))} 
          />
          <StatCard 
            title="Total Reach (Latest)" 
            value={latest.reach?.toLocaleString() || 0} 
          />
          <StatCard 
            title="Total Views (Latest)" 
            value={latest.views?.toLocaleString() || 0} 
          />
          <StatCard 
            title="Accounts Engaged" 
            value={latest.accountsEngaged?.toLocaleString() || 0} 
          />
        </div>
      )}
    </div>
  );
}
