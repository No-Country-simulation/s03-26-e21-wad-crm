export interface Message {
  id: string
  content: string
  body: string
  direction: 'inbound' | 'outbound' | 'INBOUND' | 'OUTBOUND'
  timestamp: Date
  sentAt: string
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING'
  type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker'
  mediaUrl?: string
  mimeType?: string
  caption?: string
}

export interface Conversation {
  id: string
  contactId: string
  channel: 'WHATSAPP' | 'EMAIL'
  lastMessageAt?: string
  messageCount?: number
}

export interface ContactInfo {
  id: string
  name: string
  email?: string
  phone?: string
}

export interface LockStatus {
  isAttending: boolean
  agentId?: string
  agentName?: string
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

// WhatsApp Configuration Types
export interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  appSecret: string
}

export interface WhatsAppStatus {
  connected: boolean
  phoneNumberId: string | null
  connectedAt: string | null
}

export interface WhatsAppConfigResponse {
  success: boolean
  status?: WhatsAppStatus
  error?: string
}
