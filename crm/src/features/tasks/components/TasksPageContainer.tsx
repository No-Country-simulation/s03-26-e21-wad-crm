import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { Plus } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import { TaskFilters } from './TaskFilters'
import { TaskCard } from './TaskCard'

export function TasksPageContainer() {
  const {
    tasks,
    isLoading,
    filter,
    setFilter,
    toggleTaskComplete,
    formatDate,
    isOverdue,
    pendingCount,
    completedCount,
  } = useTasks()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tareas"
        subtitle={`${pendingCount} pendientes, ${completedCount} completadas`}
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </Button>
        }
      />

      <TaskFilters filter={filter} onFilterChange={setFilter} />

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={toggleTaskComplete}
            formatDate={formatDate}
            isOverdue={isOverdue}
          />
        ))}
      </div>

      {tasks.length === 0 && <EmptyState message="No hay tareas para mostrar" />}
    </div>
  )
}
