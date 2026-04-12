import { Bell } from 'lucide-react'
import { EventTickerProps } from './types'
import { useEventTicker } from './useEventTicker'
import { EventTickerItem } from './EventTickerItem'

export function EventTicker({ data, interval = 40000, onNotificationClick }: EventTickerProps) {
  const { notifications, handleNotificationClick } = useEventTicker(data, onNotificationClick)

  const renderNotification = (notification: typeof notifications[0], index: number, isDuplicate = false) => (
    <div key={`${isDuplicate ? 'dup-' : ''}${notification.id}-${index}`} className="inline-flex items-center">
      <EventTickerItem 
        notification={notification} 
        onClick={handleNotificationClick}
      />
      <span className="text-slate-400 dark:text-slate-600 select-none flex-shrink-0 mx-2">
        •
      </span>
    </div>
  )

  if (notifications.length === 0) {
    return (
      <footer className="border-t border-border bg-muted/50">
        <div className="flex items-center px-4 h-10">
          <div className="flex-shrink-0 mr-3">
            <Bell className="size-4 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">
            No hay notificaciones
          </span>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="flex items-center px-4 h-10">
        <div className="flex-shrink-0 mr-3">
          <Bell className="size-4 text-muted-foreground" />
        </div>

        <div 
          className="flex-1 overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(90deg, transparent, currentColor 5%, currentColor 95%, transparent)',
            maskImage: 'linear-gradient(90deg, transparent, currentColor 5%, currentColor 95%, transparent)',
          }}
        >
          <div 
            className="inline-flex items-center"
            style={{ animation: `ticker-scroll ${interval}ms linear infinite` }}
          >
            {notifications.map((notif, index) => renderNotification(notif, index))}
            {notifications.map((notif, index) => renderNotification(notif, index, true))}
            {notifications.map((notif, index) => renderNotification(notif, index, true))}
          </div>
        </div>
      </div>
    </footer>
  )
}
