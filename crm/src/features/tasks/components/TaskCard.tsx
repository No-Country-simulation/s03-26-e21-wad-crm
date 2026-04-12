import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { CheckCircle2, Circle, Calendar, AlertCircle } from 'lucide-react'
import type { TaskCardProps } from '../types'
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../types'

interface TaskCardExtendedProps extends TaskCardProps {
  formatDate: (dateString?: string) => string | null
  isOverdue: (dueAt?: string, completed?: boolean) => boolean
}

export function TaskCard({ task, onToggleComplete, formatDate, isOverdue }: TaskCardExtendedProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${task.completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 flex-shrink-0 h-auto w-auto p-0 hover:bg-transparent"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
              </div>

              <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              {task.dueAt && (
                <div className={`flex items-center gap-1 ${isOverdue(task.dueAt, task.completed) ? 'text-red-600' : ''}`}>
                  {isOverdue(task.dueAt, task.completed) ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Calendar className="w-4 h-4" />
                  )}
                  <span>{formatDate(task.dueAt)}</span>
                </div>
              )}
              {task.contactId && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Contacto: {task.contactId}
                </span>
              )}
              {task.dealId && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Deal: {task.dealId}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
