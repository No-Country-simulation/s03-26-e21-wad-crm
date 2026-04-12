import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { CheckSquare, Calendar, MessageSquare, Briefcase, Search } from 'lucide-react'
import { ActionItem } from '@/mock/dashboardData'

function getTypeIcon(type: string) {
  switch (type) {
    case 'task':
      return <CheckSquare className="w-4 h-4" />
    case 'appointment':
      return <Calendar className="w-4 h-4" />
    case 'conversation':
      return <MessageSquare className="w-4 h-4" />
    case 'deal':
      return <Briefcase className="w-4 h-4" />
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

const priorityOrder = { high: 1, medium: 2, low: 3 }

interface PendingActionsListProps {
  actions: ActionItem[]
}

export function PendingActionsList({ actions }: PendingActionsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('task')

  const filteredAndSortedActions = useMemo(() => {
    let filtered = actions

    filtered = filtered.filter(action => action.type === activeTab)

    if (searchQuery) {
      filtered = filtered.filter(action =>
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }, [actions, activeTab, searchQuery])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Pendientes</CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar acciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="md:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="task">Tareas</SelectItem>
              <SelectItem value="appointment">Citas</SelectItem>
              <SelectItem value="conversation">Mensajes</SelectItem>
              <SelectItem value="deal">Deals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="hidden md:grid w-full grid-cols-4">
            <TabsTrigger value="task">Tareas</TabsTrigger>
            <TabsTrigger value="appointment">Citas</TabsTrigger>
            <TabsTrigger value="conversation">Mensajes</TabsTrigger>
            <TabsTrigger value="deal">Deals</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3">
              {filteredAndSortedActions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No se encontraron acciones
                </p>
              ) : (
                filteredAndSortedActions.map((action) => (
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
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {action.subtitle}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {action.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
