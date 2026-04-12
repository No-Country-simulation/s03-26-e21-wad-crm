import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { SidebarNavProps } from './types'
import { cn } from '@/lib/utils'

export function SidebarNav({ items, activeTab, collapsed, onItemClick }: SidebarNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        return (
          <Button
            key={item.id}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
              isActive && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50',
              !isActive && 'text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50'
            )}
            onClick={() => onItemClick(item)}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="size-4 flex-shrink-0" data-icon="inline-start" />

            {!collapsed && (
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium truncate">{item.label}</div>
              </div>
            )}

            {!collapsed && item.hasSubmenu && (
              <ChevronRight className="size-4 flex-shrink-0" />
            )}

            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-popover text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border shadow-md">
                {item.label}
              </div>
            )}

            {isActive && !item.hasSubmenu && (
              <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
            )}
          </Button>
        )
      })}
    </nav>
  )
}
