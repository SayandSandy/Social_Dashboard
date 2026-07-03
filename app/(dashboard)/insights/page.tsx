import { InsightsRepository } from '../../../repositories/insights.repository';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Sparkles, TrendingUp, TrendingDown, Lightbulb, Target } from 'lucide-react';
import { createClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AIInsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const insightsRepo = new InsightsRepository();
  const latestInsight = await insightsRepo.getLatest(user.id);

  // Cast JSONB types
  const wins = (latestInsight?.wins as string[]) || [];
  const losses = (latestInsight?.losses as string[]) || [];
  const opportunities = (latestInsight?.opportunities as string[]) || [];
  const recommendations = (latestInsight?.recommendations as string[]) || [];
  const bestContentTypes = (latestInsight?.bestContentTypes as string[]) || [];
  const postingFrequency = (latestInsight?.postingFrequency as { recommended?: string }) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Sparkles className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-bold">AI Insights</h1>
      </div>

      {!latestInsight ? (
        <div className="text-slate-400">No AI insights available yet.</div>
      ) : (
        <div className="space-y-6">
          <Card className="bg-slate-900 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)] text-white">
            <CardHeader>
              <CardTitle className="text-indigo-400">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-slate-300">
                {latestInsight.executiveSummary}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-emerald-500/30 text-white">
              <CardHeader className="flex flex-row items-center space-x-2">
                <TrendingUp className="text-emerald-400 w-5 h-5" />
                <CardTitle className="text-emerald-400">Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {wins.map((win, i) => (
                    <li key={i}>{win}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-red-500/30 text-white">
              <CardHeader className="flex flex-row items-center space-x-2">
                <TrendingDown className="text-red-400 w-5 h-5" />
                <CardTitle className="text-red-400">Losses</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {losses.map((loss, i) => (
                    <li key={i}>{loss}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-amber-500/30 text-white">
              <CardHeader className="flex flex-row items-center space-x-2">
                <Lightbulb className="text-amber-400 w-5 h-5" />
                <CardTitle className="text-amber-400">Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {opportunities.map((opp, i) => (
                    <li key={i}>{opp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-blue-500/30 text-white">
              <CardHeader className="flex flex-row items-center space-x-2">
                <Target className="text-blue-400 w-5 h-5" />
                <CardTitle className="text-blue-400">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="text-slate-200">Growth Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{latestInsight.growthStrategy}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Recommended Posting Frequency</div>
                  <div className="font-semibold text-slate-200">{postingFrequency.recommended || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Best Content Types</div>
                  <div className="font-semibold text-slate-200">{bestContentTypes.join(', ') || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
