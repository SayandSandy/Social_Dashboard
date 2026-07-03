"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { chartTheme } from "../../lib/utils/chart-theme"

interface FollowersChartProps {
  data: { date: string; followers: number }[]
  growthPct: number
}

export function FollowersChart({ data, growthPct }: FollowersChartProps) {
  const isPositive = growthPct >= 0;
  
  return (
    <Card className="bg-slate-900 border-slate-800 text-white col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-200">Follower Growth</CardTitle>
        <div className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'} bg-slate-950 px-3 py-1 rounded-full border border-slate-800`}>
          {isPositive ? '+' : ''}{growthPct.toFixed(2)}%
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis dataKey="date" {...chartTheme.axis} />
            <YAxis {...chartTheme.axis} domain={['auto', 'auto']} />
            <Tooltip 
              {...chartTheme.tooltip}
              formatter={(value: any) => [Number(value).toLocaleString(), 'Followers']}
            />
            <Line type="monotone" dataKey="followers" stroke={chartTheme.colors.danger} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
