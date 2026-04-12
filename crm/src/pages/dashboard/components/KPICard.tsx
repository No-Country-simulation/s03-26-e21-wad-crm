import { Card, CardContent } from '@/components/ui/card'
import { KPICardProps } from '../types'

const colorClasses = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  purple: 'text-purple-600 dark:text-purple-400',
  orange: 'text-orange-600 dark:text-orange-400',
  pink: 'text-pink-600 dark:text-pink-400',
  teal: 'text-teal-600 dark:text-teal-400',
}

export function KPICard({ icon, label, value, color }: KPICardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className={`mb-2 ${colorClasses[color]}`}>{icon}</div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
