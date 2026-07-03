"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { chartTheme } from "../../lib/utils/chart-theme"

interface ReachChartProps {
  data: { date: string; reach: number }[]
}

export function ReachChart({ data }: ReachChartProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 text-white col-span-full">
      <CardHeader>
        <CardTitle className="text-slate-200">Reach Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis dataKey="date" {...chartTheme.axis} />
            <YAxis {...chartTheme.axis} />
            <Tooltip 
              {...chartTheme.tooltip}
              formatter={(value: any) => [Number(value).toLocaleString(), 'Reach']}
            />
            <Line type="monotone" dataKey="reach" stroke={chartTheme.colors.success} strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
