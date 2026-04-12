import { useState, useEffect } from 'react'
import { Notification, NotificationType } from './types'
import { TabKey } from '@/types'

interface UseEventTickerReturn {
  notifications: Notification[]
  handleNotificationClick: (notification: Notification) => void
  getIconColor: (type: NotificationType) => string
  getBadgeStyles: (type: NotificationType) => string
}

export function useEventTicker(
  data: Notification[],
  onNotificationClick?: (section: TabKey) => void
): UseEventTickerReturn {
  const [notifications] = useState<Notification[]>(data)

  useEffect(() => {}, [data])

  const handleNotificationClick = (notification: Notification) => {
    if (notification.section && onNotificationClick) {
      onNotificationClick(notification.section)
    }
  }

  const getIconColor = (type: NotificationType): string => {
    const colorMap: Record<NotificationType, string> = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    }
    return colorMap[type]
  }

  const getBadgeStyles = (type: NotificationType): string => {
    const styleMap: Record<NotificationType, string> = {
      info: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
      success: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20',
      warning: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20',
      error: 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
    }
    return styleMap[type]
  }

  return {
    notifications,
    handleNotificationClick,
    getIconColor,
    getBadgeStyles,
  }
}
