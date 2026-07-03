"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { chartTheme } from "../../lib/utils/chart-theme"

interface MessagesChartProps {
  data: { date: string; received: number; sent: number }[]
}

export function MessagesChart({ data }: MessagesChartProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 text-white col-span-full">
      <CardHeader>
        <CardTitle className="text-slate-200">Messages Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis dataKey="date" {...chartTheme.axis} />
            <YAxis {...chartTheme.axis} />
            <Tooltip {...chartTheme.tooltip} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="received" name="Received" fill={chartTheme.colors.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="sent" name="Sent" fill={chartTheme.colors.info} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
