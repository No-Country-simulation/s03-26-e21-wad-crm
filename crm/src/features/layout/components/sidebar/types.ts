import { TabKey } from '@/types'
import { LucideIcon } from 'lucide-react'

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

export interface SidebarSubNavProps {
  parentItem: NavItem
  conversations: Conversation[]
  onBack: () => void
  onConversationClick: (conversation: Conversation) => void
  activeConversationId?: string
}

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
