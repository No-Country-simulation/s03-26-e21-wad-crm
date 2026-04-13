import { TabKey } from '@/types'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

export interface NavItem {
  id: TabKey
  label: string
  icon: LucideIcon
  description?: string
  hasSubmenu?: boolean
}

export interface Conversation {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: Date
  unreadCount?: number
  isOnline?: boolean
}

export interface SidebarProps {
  activeTab: TabKey
  allowedTabs: TabKey[]
  onTabChange: (tab: TabKey) => void
  isCollapsed?: boolean
  onToggleCollapse?: (collapsed: boolean) => void
  onConversationSelect?: (conversation: Conversation) => void
  activeConversationId?: string
}

export interface SidebarNavProps {
  items: NavItem[]
  activeTab: TabKey
  collapsed: boolean
  onItemClick: (item: NavItem) => void
}

// Base props para todos los sub-navs
export interface SubNavBaseProps {
  collapsed: boolean
  onBack: () => void
}

// Props específicas de cada sub-nav

// Conversaciones (WhatsApp, Email)
export interface ConversationsSubNavData {
  conversations: Conversation[]
  activeConversationId?: string
  onConversationClick: (conversation: Conversation) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}

// Settings
export interface SettingsSubNavData {
  activeSection?: string
  onSectionChange?: (section: string) => void
  hasPermission?: (permission: string) => boolean
}

// Contactos, Deals, Tasks, Appointments (lista simple)
export interface ListSubNavData {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}

// Union type para todos los sub-navs data
export type SubNavData = ConversationsSubNavData | SettingsSubNavData | ListSubNavData

// Props completas del sub-nav
export interface SidebarSubNavProps extends SubNavBaseProps {
  data?: SubNavData
}

// Tipo para el registro de sub-navs
export type SubNavComponent = React.ComponentType<SidebarSubNavProps>

export interface ConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string
  onConversationClick: (conversation: Conversation) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export interface WhatsAppOptionsProps {
  isMobile: boolean
}
