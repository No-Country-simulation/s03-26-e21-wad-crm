import { Button } from '@/shared/ui/button'
import type { TaskFiltersProps } from '../types'

export function TaskFilters({ filter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={filter === 'all' ? 'default' : 'outline'}
        onClick={() => onFilterChange('all')}
        size="sm"
      >
        Todas
      </Button>
      <Button
        variant={filter === 'pending' ? 'default' : 'outline'}
        onClick={() => onFilterChange('pending')}
        size="sm"
      >
        Pendientes
      </Button>
      <Button
        variant={filter === 'completed' ? 'default' : 'outline'}
        onClick={() => onFilterChange('completed')}
        size="sm"
      >
        Completadas
      </Button>
    </div>
  )
}
