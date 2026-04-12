import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'
import { PageHeader } from '@/shared/components/page-header'
import { Plus } from 'lucide-react'
import { useDeals } from '../hooks/useDeals'
import { DealStageColumn } from './DealStageColumn'
import { DealsTable } from './DealsTable'

export function DealsPageContainer() {
  const {
    deals,
    isLoading,
    view,
    setView,
    stages,
    getDealsByStage,
    formatCurrency,
  } = useDeals()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Deals"
        subtitle={`${deals.length} oportunidades activas`}
        actions={
          <>
            <Button variant="outline" onClick={() => setView(view === 'kanban' ? 'table' : 'kanban')}>
              {view === 'kanban' ? 'Vista Tabla' : 'Vista Kanban'}
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Nuevo Deal
            </Button>
          </>
        }
      />

      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <DealStageColumn
              key={stage.id}
              stage={stage}
              deals={getDealsByStage(stage.id)}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      {view === 'table' && (
        <DealsTable deals={deals} formatCurrency={formatCurrency} />
      )}
    </div>
  )
}
