import { RoleType } from '@/types'
import type { ConnectionStatus } from './types/header.config'
import { STATUS_CONFIG } from './types/header.config'
import { ConnectionStatusBadge } from './components/ConnectionStatusBadge'
import { RoleBadge } from './components/RoleBadge'
import { UserMenu } from './components/UserMenu'

interface HeaderProps {
  userRole?: RoleType
  userName?: string
  onLogout?: () => void
  connectionStatus?: ConnectionStatus
  onProfileClick?: () => void
  onSettingsClick?: () => void
}

export function Header({
  userRole = 'USER',
  userName = 'Usuario',
  onLogout,
  connectionStatus = STATUS_CONFIG["connected"].label as ConnectionStatus,
  onProfileClick,
  onSettingsClick,
}: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 h-16">
        <ConnectionStatusBadge status={connectionStatus} />

        <div className="flex items-center gap-4">
          <RoleBadge role={userRole} />
          <UserMenu
            userName={userName}
            userRole={userRole}
            connectionStatus={connectionStatus}
            onLogout={onLogout}
            onProfileClick={onProfileClick}
            onSettingsClick={onSettingsClick}
          />
        </div>
      </div>
    </header>
  )
}