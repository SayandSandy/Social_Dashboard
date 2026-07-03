export const chartTheme = {
  tooltip: {
    contentStyle: { 
      backgroundColor: '#0f172a', 
      border: '1px solid #1e293b',
      borderRadius: '8px',
      color: '#f8fafc'
    },
    itemStyle: { color: '#f8fafc' },
    labelStyle: { color: '#94a3b8', marginBottom: '4px' }
  },
  grid: {
    stroke: '#334155',
    strokeDasharray: '3 3',
    vertical: false
  },
  axis: {
    stroke: '#94a3b8',
    fontSize: 12,
    tickLine: false,
    axisLine: false,
    tickMargin: 8
  },
  colors: {
    primary: '#6366f1', // Indigo
    secondary: '#ec4899', // Pink
    success: '#10b981', // Emerald
    info: '#3b82f6', // Blue
    warning: '#f59e0b', // Amber
    danger: '#ef4444' // Red
  }
}
