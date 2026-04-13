import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { SidebarSubNavProps } from '../types'
import { SETTINGS_NAV_ITEMS, type SettingsSubNavData } from './constants'
import { SubNavBackButton } from '../shared'

export function SettingsSubNav({ 
  collapsed, 
  onBack, 
  data 
}: SidebarSubNavProps) {
  const { activeSection, onSectionChange, hasPermission } = (data as SettingsSubNavData) ?? {}
  
  const visibleItems = SETTINGS_NAV_ITEMS.filter(
    item => !item.permission || hasPermission?.(item.permission)
  )

  if (collapsed) {
    return (
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        <SubNavBackButton collapsed={collapsed} onBack={onBack} label="Config" />
        
        <Separator className="my-2" />
        
        <div className="flex flex-col gap-1">
          {visibleItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeSection === item.id ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn(
                    'size-10 relative group',
                    activeSection === item.id && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
                  )}
                  onClick={() => onSectionChange?.(item.id)}
                >
                  <span className="text-lg">{item.icon}</span>
                  {activeSection === item.id && (
                    <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </nav>
    )
  }

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 flex flex-col gap-1">
      <SubNavBackButton collapsed={collapsed} onBack={onBack} label="Configuración" />

      <Separator className="my-2" />

      <div className="flex flex-col gap-1">
        {visibleItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
              activeSection === item.id && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50',
              activeSection !== item.id && 'text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50'
            )}
            onClick={() => onSectionChange?.(item.id)}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div className="flex-1 text-left min-w-0">
              <span className="text-sm font-medium truncate">{item.label}</span>
            </div>
            {activeSection === item.id && (
              <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
            )}
          </Button>
        ))}
      </div>
    </nav>
  )
}