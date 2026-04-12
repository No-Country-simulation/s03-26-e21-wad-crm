import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AverageSalesData } from '../types'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

interface AverageTotalSalesChartProps {
  data: AverageSalesData[]
}

export function AverageTotalSalesChart({ data }: AverageTotalSalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Contactos</CardTitle>
        <p className="text-sm text-slate-500">Por estado</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-around gap-6">
          {data.map((item, index) => (
            <div key={item.name} className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={COLORS[index]}
                    strokeWidth="8"
                    strokeDasharray={`${item.percentage * 2.51} ${251 - item.percentage * 2.51}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.percentage}%
                  </span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-[clamp(1.25rem,2vw,1.5rem)] font-bold text-slate-900 dark:text-white">
                  {item.value.toLocaleString()}
                </p>
                <p className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-slate-500">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
