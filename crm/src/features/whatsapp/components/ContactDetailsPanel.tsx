import { useState } from 'react'
import { Calendar, CheckSquare, MessageSquare, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Conversation } from '../../layout/components/sidebar'

interface ContactDetailsPanelProps {
  conversation: Conversation
}

type TabId = 'tasks' | 'appointments' | 'notes' | 'info'

const tabs: { id: TabId; label: string; icon: typeof CheckSquare }[] = [
  { id: 'tasks', label: 'Tareas', icon: CheckSquare },
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'notes', label: 'Notas', icon: MessageSquare },
  { id: 'info', label: 'Info', icon: User },
]

export function ContactDetailsPanel({ conversation }: ContactDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('tasks')

  return (
    <div className="h-full flex flex-col bg-sidebar">
      <div className="flex border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={cn(
                'flex-1 rounded-none h-12 flex flex-col items-center justify-center gap-1',
                isActive && 'bg-green-600/20 text-green-600 border-b-2 border-green-600'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              <span className="text-[10px]">{tab.label}</span>
            </Button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'tasks' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Tareas</h3>
            <p className="text-sm text-muted-foreground italic">No hay tareas</p>
          </div>
        )}
        {activeTab === 'appointments' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Citas</h3>
            <p className="text-sm text-muted-foreground italic">No hay citas</p>
          </div>
        )}
        {activeTab === 'notes' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Notas</h3>
            <p className="text-sm text-muted-foreground italic">No hay notas</p>
          </div>
        )}
        {activeTab === 'info' && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Información</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Nombre:</span> {conversation.name}</p>
              <p><span className="text-muted-foreground">Último mensaje:</span> {conversation.lastMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}