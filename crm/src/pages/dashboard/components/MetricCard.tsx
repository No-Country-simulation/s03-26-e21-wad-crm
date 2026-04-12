import { Card, CardContent } from '@/shared/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { MetricCardProps } from '../types'

export function MetricCard({ title, value, change, trend, comparison }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-500 mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${value.toLocaleString()}
          </p>
          <div className="flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
              {change}%
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">{comparison}</p>
      </CardContent>
    </Card>
  )
}
