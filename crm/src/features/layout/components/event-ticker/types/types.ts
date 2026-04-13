import { TabKey } from '@/types'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  section?: TabKey
}

export interface EventTickerProps {
  data: Notification[]
  interval?: number
  onNotificationClick?: (section: TabKey) => void
}

export interface EventTickerItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
}
