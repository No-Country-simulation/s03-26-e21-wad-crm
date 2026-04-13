export interface SettingsNavItem {
  id: string
  label: string
  icon: string
  description?: string
  permission: string | null
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  // Perfil
  { id: 'profile', label: 'Mi Perfil', icon: '👤', permission: null },
  
  // Integraciones - Separadas por responsabilidad
  { id: 'whatsapp-config', label: 'WhatsApp', icon: '📱', permission: 'settings:read' },
  { id: 'email-config', label: 'Email', icon: '📧', permission: 'settings:read' },
  { id: 'webhooks', label: 'Webhooks', icon: '🔗', permission: 'settings:read' },
  
  // Usuarios y Permisos
  { id: 'roles', label: 'Roles y Permisos', icon: '🔐', permission: 'settings:write' },
  { id: 'agents', label: 'Agentes', icon: '👥', permission: 'settings:read' },
  
  // Plantillas
  { id: 'templates', label: 'Plantillas', icon: '📝', permission: 'settings:write' },
  
  // Negocio
  { id: 'business', label: 'Negocio', icon: '🏢', permission: 'settings:write' },
]

export interface SettingsSubNavData {
  activeSection?: string
  onSectionChange?: (section: string) => void
  hasPermission: (permission: string) => boolean
}