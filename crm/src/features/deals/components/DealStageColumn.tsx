import type { DealStageColumnProps } from '../types'
import { DealCard } from './DealCard'

export function DealStageColumn({ stage, deals, formatCurrency }: DealStageColumnProps) {
  const stageValue = deals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{stage.name}</h3>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
            {deals.length}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{formatCurrency(stageValue)}</p>
        
        <div className="space-y-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} formatCurrency={formatCurrency} />
          ))}
        </div>
      </div>
    </div>
  )
}
