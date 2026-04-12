import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DollarSign } from 'lucide-react'
import type { DealCardProps } from '../types'

export function DealCard({ deal, formatCurrency }: DealCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{deal.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">{formatCurrency(deal.value)}</span>
          </div>
          <span className="text-xs text-gray-500">{deal.stage.probability}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
