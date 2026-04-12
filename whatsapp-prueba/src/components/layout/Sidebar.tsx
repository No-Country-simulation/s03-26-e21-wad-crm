/**
 * Sidebar - Navigation panel
 *
 * Features:
 * - Collapsible navigation
 * - Tab filtering based on RBAC
 * - Quick action buttons
 * - Current tab highlight
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare, Send, BookOpen, Settings, Database, History, Zap } from 'lucide-react'
import { TABS } from '@/utils/constants'
import { TabKey } from '@/types'

interface SidebarProps {
  activeTab: TabKey
  allowedTabs: TabKey[]
  onTabChange: (tab: TabKey) => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
}

// Map tabs to icons and labels
const TAB_CONFIG: Record<TabKey, { icon: React.ReactNode; label: string; description?: string }> = {
  [TABS.CONVERSATIONS]: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: 'Conversaciones',
    description: 'Ver y gestionar chats',
  },
  [TABS.SEND]: {
    icon: <Send className="w-4 h-4" />,
    label: 'Enviar',
    description: 'Enviar mensajes',
  },
  [TABS.TEMPLATES]: {
    icon: <BookOpen className="w-4 h-4" />,
    label: 'Templates',
    description: 'Plantillas de mensajes',
  },
  [TABS.CONFIG]: {
    icon: <Settings className="w-4 h-4" />,
    label: 'Configuración',
    description: 'Configurar WhatsApp',
  },
  [TABS.CRM]: {
    icon: <Database className="w-4 h-4" />,
    label: 'CRM',
    description: 'Configurar backend',
  },
  [TABS.LOGS]: {
    icon: <History className="w-4 h-4" />,
    label: 'Logs',
    description: 'Historial de actividad',
  },
  [TABS.WEBHOOK]: {
    icon: <Zap className="w-4 h-4" />,
    label: 'Webhook',
    description: 'Simulador de webhooks',
  },
}

export function Sidebar({
  activeTab,
  allowedTabs,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState)
    onToggleCollapse?.(newState)
  }

  return (
    <aside
      className={`border-r border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-all duration-300 flex flex-col h-full ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Button */}
      <div className="p-4 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
        {!collapsed && <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Navegación</span>}
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
          title={collapsed ? 'Expandir' : 'Contraer'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {allowedTabs.map((tab) => {
          const config = TAB_CONFIG[tab]
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group ${
                isActive
                  ? 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/50'
              }`}
              title={collapsed ? config.label : undefined}
            >
              <span className="flex-shrink-0">{config.icon}</span>

              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">{config.label}</div>
                  {config.description && (
                    <div className="text-xs text-slate-500 dark:text-slate-500 truncate">{config.description}</div>
                  )}
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {config.label}
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-300 dark:border-slate-800">
          <div className="text-xs text-slate-600 dark:text-slate-500 space-y-1">
            <p>💡 <strong>Tip:</strong> Use Tab para navegar rápidamente</p>
          </div>
        </div>
      )}
    </aside>
  )
}
