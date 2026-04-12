import { Badge } from '@/components/ui/badge'
import { ConnectionStatus, STATUS_CONFIG } from '../types/header.config'

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge variant="secondary" className="gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="whitespace-nowrap">{config.label}</span>
    </Badge>
  )
}