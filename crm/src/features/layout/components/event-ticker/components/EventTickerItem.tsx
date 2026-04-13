import { Info, CheckCircle, AlertTriangle, AlertCircle, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventTickerItemProps } from '../types/types'
import { useEventTicker } from '../hooks/useEventTicker'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

export function EventTickerItem({ notification, onClick }: EventTickerItemProps) {
  const { getIconColor, getBadgeStyles } = useEventTicker([])
  const Icon = iconMap[notification.type]

  return (
    <Button
      variant="ghost"
      onClick={() => onClick?.(notification)}
      title={notification.message}
      disabled={!notification.section}
      className={cn(
        'flex-shrink-0 w-[220px] h-8',
        'inline-flex items-center gap-2 px-3',
        'rounded-md border transition-all hover:scale-105',
        getBadgeStyles(notification.type),
        !notification.section && 'cursor-default'
      )}
    >
      <Icon className={cn('size-3.5 flex-shrink-0', getIconColor(notification.type))} />
      <span className="text-xs truncate">
        {notification.message}
      </span>
    </Button>
  )
}
