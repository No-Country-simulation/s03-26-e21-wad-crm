import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { CheckSquare, Calendar, MessageSquare } from 'lucide-react'
import { PendingAction } from '../types'

function getTypeIcon(type: string) {
  switch (type) {
    case 'task':
      return <CheckSquare className="w-4 h-4" />
    case 'appointment':
      return <Calendar className="w-4 h-4" />
    case 'follow-up':
      return <MessageSquare className="w-4 h-4" />
    default:
      return null
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
    case 'low':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    default:
      return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
  }
}

interface PendingActionsListProps {
  actions: PendingAction[]
}

export function PendingActionsList({ actions }: PendingActionsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Pendientes</CardTitle>
        <p className="text-sm text-slate-500">{actions.length} tareas por completar</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5 text-slate-500">
                {getTypeIcon(action.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {action.title}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(action.priority)}`}
                  >
                    {action.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {action.description}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Vence: {action.dueDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
