import { useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

interface SidebarFooterProps {
  collapsed: boolean
}

const themeConfig = {
  light: { icon: Sun, label: 'Claro' },
  dark: { icon: Moon, label: 'Oscuro' },
  system: { icon: Monitor, label: 'Sistema' },
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  const { theme, setTheme } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    setIsOpen(false)
  }

  if (collapsed) {
    const CurrentIcon = themeConfig[theme as keyof typeof themeConfig].icon
    const currentLabel = themeConfig[theme as keyof typeof themeConfig].label

    return (
      <div className="border-t border-border p-2 w-16 overflow-visible">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center cursor-help">
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50"
                  >
                    <CurrentIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-16 min-w-0 p-1">
                  <div className="flex flex-col gap-1 items-center">
                    {Object.entries(themeConfig).map(([key, { icon: Icon }]) => (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'w-8 h-8 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50 transition-colors',
                              theme === key && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
                            )}
                            onClick={() => handleThemeChange(key as 'light' | 'dark' | 'system')}
                          >
                            <Icon className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {themeConfig[key as keyof typeof themeConfig].label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            {currentLabel}
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="border-t border-border pl-10 pr-3 py-3 flex items-center justify-between gap-4 group">
      <span className="text-sm text-muted-foreground group-hover:text-green-600 transition-colors">Tema</span>
      <ToggleGroup 
        type="single" 
        value={theme} 
        onValueChange={(value) => value && setTheme(value as 'light' | 'dark' | 'system')}
        className="justify-end"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="light" 
              aria-label="Tema claro"
              className={cn(
                'h-8 w-8 p-0 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50 transition-colors',
                theme === 'light' && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
              )}
            >
              <Sun className="size-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Claro</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="dark" 
              aria-label="Tema oscuro"
              className={cn(
                'h-8 w-8 p-0 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50 transition-colors',
                theme === 'dark' && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
              )}
            >
              <Moon className="size-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Oscuro</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem 
              value="system" 
              aria-label="Tema del sistema"
              className={cn(
                'h-8 w-8 p-0 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50 transition-colors',
                theme === 'system' && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
              )}
            >
              <Monitor className="size-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Sistema</TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </div>
  )
}
