import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SubNavBackButtonProps {
  collapsed: boolean
  onBack: () => void
  label?: string
  activeIndicator?: boolean
}

export function SubNavBackButton({ 
  collapsed, 
  onBack, 
  label = 'Volver',
  activeIndicator = true 
}: SubNavBackButtonProps) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            className={cn(
              'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
              'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
            )}
            onClick={onBack}
          >
            <ChevronRight className="size-4 flex-shrink-0 rotate-180" data-icon="inline-start" />
            {activeIndicator && (
              <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      variant="secondary"
      className={cn(
        'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
        'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
      )}
      onClick={onBack}
    >
      <ChevronRight className="size-4 flex-shrink-0 rotate-180" data-icon="inline-start" />
      <div className="flex-1 text-left min-w-0">
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      {activeIndicator && (
        <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
      )}
    </Button>
  )
}