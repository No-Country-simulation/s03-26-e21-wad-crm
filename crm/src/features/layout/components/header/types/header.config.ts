import { RoleType } from '@/types'

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'

export const STATUS_CONFIG = {
  connected: {
    color: 'bg-green-500',
    label: 'Conectado',
    badgeVariant: 'success' as const,
  },
  connecting: {
    color: 'bg-amber-500',
    label: 'Conectando...',
    badgeVariant: 'warning' as const,
  },
  disconnected: {
    color: 'bg-red-500',
    label: 'Desconectado',
    badgeVariant: 'danger' as const,
  },
} as const

export const ROLE_CONFIG: Record<RoleType, { color: string }> = {
  ADMIN: { color: 'bg-red-600' },
  MANAGER: { color: 'bg-purple-600' },
  AGENT: { color: 'bg-blue-600' },
  USER: { color: 'bg-green-600' },
  VIEWER: { color: 'bg-slate-600' },
}

export const MENU_ITEMS = [
  { id: 'profile', label: 'Mi Perfil', icon: 'User' },
  { id: 'settings', label: 'Configuración', icon: 'Settings' },
] as const
