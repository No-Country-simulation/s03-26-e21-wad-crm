import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, TrendingUp, MessageCircle } from 'lucide-react'

interface ResponseMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: React.ReactNode
}

const metrics: ResponseMetric[] = [
  {
    label: 'Tiempo de respuesta',
    value: '5min',
    change: '-2min',
    trend: 'up',
    icon: <Clock className="w-5 h-5" />,
  },
  {
    label: 'Tasa de respuesta',
    value: '94%',
    change: '+8%',
    trend: 'up',
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    label: 'Conversiones',
    value: '23',
    change: '+5',
    trend: 'up',
    icon: <TrendingUp className="w-5 h-5" />,
  },
]

export function ResponseMetricsCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Métricas de Respuesta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 dark:text-blue-400">
                  {metric.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
