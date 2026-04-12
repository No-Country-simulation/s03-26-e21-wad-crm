import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronRight } from 'lucide-react'
import { SidebarNavProps } from './types'
import { cn } from '@/lib/utils'

export function SidebarNav({ items, activeTab, collapsed, onItemClick }: SidebarNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id

        if (collapsed) {
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
                    isActive && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50',
                    !isActive && 'text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50'
                  )}
                  onClick={() => onItemClick(item)}
                >
                  <Icon className="size-4 flex-shrink-0" data-icon="inline-start" />

                  {isActive && !item.hasSubmenu && (
                    <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        }

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
          >
            <Icon className="sizelex-shrink-0" data-icon="inline-start" />

            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">{item.label}</div>
            </div>

            {item.hasSubmenu && (
              <ChevronRight className="size-4 flex-shrink-0" />
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
