/**
 * Header - Top navigation bar
 *
 * Displays:
 * - Logo and app title
 * - Current user role badge
 * - Logout button
 * - Status indicators
 */

import { LogOut, MessageCircle, Moon, Sun, User, ChevronDown } from 'lucide-react'
import { RoleType } from '@/types'
import { useThemeStore } from '@/store/themeStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  userRole?: RoleType
  userName?: string
  onLogout?: () => void
  connectionStatus?: 'connected' | 'connecting' | 'disconnected'
}

export function Header({
  userRole = 'USER',
  userName,
  onLogout,
  connectionStatus = 'connected',
}: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore()
  
  const roleColors: Record<RoleType, string> = {
    ADMIN: 'bg-red-600',
    AGENT: 'bg-blue-600',
    USER: 'bg-green-600',
    VIEWER: 'bg-slate-600',
  }

  const statusColors = {
    connected: 'bg-green-500',
    connecting: 'bg-amber-500',
    disconnected: 'bg-red-500',
  }

  return (
    <header className="border-b border-slate-800 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4 max-w-full">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">WhatsApp CRM</h1>
            <p className="text-xs text-slate-500 dark:text-slate-500 truncate">Gestión inteligente de conversaciones</p>
          </div>
        </div>

        {/* Right: User info, status, logout */}
        <div className="flex items-center gap-4 ml-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]} animate-pulse`}
            />
            <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {connectionStatus === 'connected'
                ? 'Conectado'
                : connectionStatus === 'connecting'
                  ? 'Conectando...'
                  : 'Desconectado'}
            </span>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <span className={`w-2 h-2 rounded-full ${roleColors[userRole]}`} />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {userRole}
            </span>
          </div>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-300 dark:border-slate-700">
                <User className="w-4 h-4" />
                {userName && <span className="text-sm font-medium hidden sm:inline">{userName}</span>}
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                <span>{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onLogout && (
                <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
