import { useEffect, useState } from 'react'
import { useDealsStore } from '../store'
import type { DealView } from '../types'
import { DEAL_STAGES } from '../types'

export function useDeals() {
  const { deals, isLoading, fetchDeals } = useDealsStore()
  const [view, setView] = useState<DealView>('kanban')

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  const activeDeals = deals.filter(d => !d.deleted)

  const getDealsByStage = (stageId: string) => {
    return activeDeals.filter((deal) => deal.stage.id === stageId)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value)
  }

  return {
    deals: activeDeals,
    isLoading,
    view,
    setView,
    stages: DEAL_STAGES,
    getDealsByStage,
    formatCurrency,
  }
}
