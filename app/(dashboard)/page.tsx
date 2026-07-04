import { AnalyticsService } from '../../services/analytics.service';
import { StatCard } from '../../components/cards/StatCard';
import { CalculationsService } from '../../services/calculations.service';
import { createClient } from '../../lib/supabase/server';

// Force dynamic since we're fetching from DB which changes daily
export const dynamic = 'force-dynamic';

export default async function OverviewPage() {
  try {
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
  } catch (error: any) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-lg max-w-2xl mx-auto mt-8">
        <h2 className="text-xl font-bold text-red-400 mb-2">Dashboard Render Error</h2>
        <p className="text-red-200 font-mono text-sm break-all">{error.message || JSON.stringify(error)}</p>
        <p className="text-slate-400 text-sm mt-4">Please screenshot this box so I can fix the issue!</p>
      </div>
    );
  }
}
