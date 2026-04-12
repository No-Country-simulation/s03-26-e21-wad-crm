import { ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { RoleType } from '@/types'
import type { ConnectionStatus } from '../types/header.config'
import { UserAvatar } from './UserAvatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserMenuProps {
  userName: string
  userRole: RoleType
  connectionStatus: ConnectionStatus
  onLogout?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
}

export function UserMenu({
  userName,
  userRole,
  connectionStatus,
  onLogout,
  onProfileClick,
  onSettingsClick,
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          title="Menú de usuario"
        >
          <UserAvatar userName={userName} />

          <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
            {userName}
          </span>

          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground">{userRole}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfileClick}>
          <User className="mr-2 h-4 w-4" data-icon="inline-start" />
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettingsClick}>
          <Settings className="mr-2 h-4 w-4" data-icon="inline-start" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} variant="destructive">
          <LogOut className="mr-2 h-4 w-4" data-icon="inline-start" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}