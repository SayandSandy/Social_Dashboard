"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { chartTheme } from "../../lib/utils/chart-theme"

interface InteractionsChartProps {
  data: { date: string; interactions: number }[]
}

export function InteractionsChart({ data }: InteractionsChartProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 text-white col-span-full">
      <CardHeader>
        <CardTitle className="text-slate-200">Interactions Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis dataKey="date" {...chartTheme.axis} />
            <YAxis {...chartTheme.axis} />
            <Tooltip 
              {...chartTheme.tooltip}
              formatter={(value: any) => [Number(value).toLocaleString(), 'Interactions']}
            />
            <Line type="monotone" dataKey="interactions" stroke={chartTheme.colors.warning} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
