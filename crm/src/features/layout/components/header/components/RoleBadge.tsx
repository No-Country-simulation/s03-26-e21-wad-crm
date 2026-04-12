import { Badge } from '@/components/ui/badge'
import { RoleType } from '@/types'
import { ROLE_CONFIG } from '../types/header.config'

interface RoleBadgeProps {
  role: RoleType
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role]

  return (
    <Badge variant="outline" className="gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="whitespace-nowrap">{role}</span>
    </Badge>
  )
}