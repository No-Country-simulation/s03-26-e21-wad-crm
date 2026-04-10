/**
 * Header - Top navigation bar
 *
 * Displays:
 * - Logo and app title
 * - Current user role badge
 * - Logout button
 * - Status indicators
 */

import { LogOut, MessageCircle } from 'lucide-react'
import { RoleType } from '@/types'

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
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4 max-w-full">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">WhatsApp CRM</h1>
            <p className="text-xs text-slate-500 truncate">Gestión inteligente de conversaciones</p>
          </div>
        </div>

        {/* Right: User info, status, logout */}
        <div className="flex items-center gap-4 ml-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]} animate-pulse`}
            />
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {connectionStatus === 'connected'
                ? 'Conectado'
                : connectionStatus === 'connecting'
                  ? 'Conectando...'
                  : 'Desconectado'}
            </span>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${roleColors[userRole]}`} />
            <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
              {userRole}
            </span>
          </div>

          {/* User Name (optional) */}
          {userName && (
            <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-slate-800/50">
              <span className="text-sm text-slate-300">{userName}</span>
            </div>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 transition-colors border border-red-800/50"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Salir</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
