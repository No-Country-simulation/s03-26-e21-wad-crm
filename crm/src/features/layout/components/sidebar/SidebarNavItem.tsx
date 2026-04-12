import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavItem } from './types'
import { cn } from '@/lib/utils'

interface SidebarNavItemProps {
  item: NavItem
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}

export function SidebarNavItem({ item, isActive, collapsed, onClick }: SidebarNavItemProps) {
  const Icon = item.icon

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
        isActive && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50',
        !isActive && 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-4 h-4 flex-shrink-0" data-icon="inline-start" />

      {!collapsed && (
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium truncate">{item.label}</div>
          {item.description && (
            <div className="text-xs text-muted-foreground truncate">
              {item.description}
            </div>
          )}
        </div>
      )}

      {!collapsed && item.hasSubmenu && (
        <ChevronRight className="w-4 h-4 flex-shrink-0" />
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
}