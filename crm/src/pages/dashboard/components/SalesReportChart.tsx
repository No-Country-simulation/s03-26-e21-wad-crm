import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { SalesReportData } from '../types'

interface SalesReportChartProps {
  data: SalesReportData[]
}

export function SalesReportChart({ data }: SalesReportChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Report</CardTitle>
        <p className="text-sm text-slate-500">2017-2018</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="category" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
