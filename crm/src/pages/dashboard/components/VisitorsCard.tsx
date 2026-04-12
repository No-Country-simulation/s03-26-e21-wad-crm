import { Card, CardContent } from '@/shared/ui/card'
import { Users, TrendingDown } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'
import { VisitorsData, ChartDataPoint } from '../types'

interface VisitorsCardProps {
  data: VisitorsData
  chartData: ChartDataPoint[]
}

export function VisitorsCard({ data, chartData }: VisitorsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slate-500" />
          <span className="text-sm text-slate-500">Visitors this year</span>
        </div>
        <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          {data.count.toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-500">{data.change}%</span>
        </div>
        <div className="mt-8 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.slice(0, 6)}>
              <Line
                type="monotone"
                dataKey="marketingSales"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
