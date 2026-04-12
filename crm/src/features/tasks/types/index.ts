export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  dueAt?: string
  contactId?: string
  dealId?: string
  createdAt: string
  updatedAt: string
}

export type TaskFilter = 'all' | 'pending' | 'completed'

export interface TaskCardProps {
  task: Task
  onToggleComplete: (id: string) => void
}

export interface TaskFiltersProps {
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  HIGH: 'text-red-600 bg-red-50',
  MEDIUM: 'text-yellow-600 bg-yellow-50',
  LOW: 'text-green-600 bg-green-50',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}
