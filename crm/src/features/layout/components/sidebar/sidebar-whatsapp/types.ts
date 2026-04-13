export interface WhatsAppConversation {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: Date
  unreadCount?: number
  isOnline?: boolean
}

export interface WhatsAppSubNavData {
  conversations: WhatsAppConversation[]
  activeConversationId?: string
  onConversationClick: (conversation: WhatsAppConversation) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}

export type { Conversation } from '../../types'