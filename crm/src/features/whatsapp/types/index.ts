export interface Message {
  id: string
  content: string
  direction: 'inbound' | 'outbound'
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read' | 'failed'
}

export interface ConversationData {
  id: string
  name: string
  phone: string
  avatar?: string
  isOnline?: boolean
  messages: Message[]
}

export interface WhatsAppConversationProps {
  conversation: ConversationData
  onBack?: () => void
}

export interface MessageBubbleProps {
  message: Message
}

export interface ConversationHeaderProps {
  conversation: ConversationData
  onBack?: () => void
}

export interface MessageInputProps {
  onSend: (message: string) => void
}

export interface WhatsAppPageProps {
  selectedConversationId: string | null
  onSelectConversation: (id: string | null) => void
}

export interface ConversationsPanelProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export interface SendPanelProps {
  conversationId: string
  config?: any
  templates?: any[]
  crmConfig?: any
}

export interface EmptyStateProps {
  message: string
  description?: string
}
