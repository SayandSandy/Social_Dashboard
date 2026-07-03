import { AnalyticsService } from '../../../services/analytics.service';
import { InteractionsChart } from '../../../components/charts/InteractionsChart';
import { StatCard } from '../../../components/cards/StatCard';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function InteractionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const analyticsService = new AnalyticsService(user.id);
  
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 90); // Last 90 days for trends
  
  const rawData = await analyticsService.getDashboardData(start, end);
  
  const chartData = rawData
    .map(d => ({ 
      date: d.date, 
      interactions: (d.accountsEngaged || 0) + (d.profileActivity || 0) + (d.websiteClicks || 0)
    }))
    .reverse(); // Chronological for chart

  const totalInteractions = chartData.reduce((sum, item) => sum + item.interactions, 0);
  const avgInteractions = chartData.length > 0 ? Math.round(totalInteractions / chartData.length) : 0;
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Interactions Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Interactions (90d)" value={totalInteractions.toLocaleString()} />
        <StatCard title="Average Daily Interactions (90d)" value={avgInteractions.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {chartData.length > 0 ? (
          <InteractionsChart data={chartData} />
        ) : (
          <div className="text-slate-400">No interaction data available.</div>
        )}
      </div>
    </div>
  );
}
