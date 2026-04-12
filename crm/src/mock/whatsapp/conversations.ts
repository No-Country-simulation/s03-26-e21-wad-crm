/**
 * Mock Data - WhatsApp Conversations
 *
 * DTOs realistas para visualizar la UI con datos de prueba
 * Features:
 * - Conversaciones con múltiples estados
 * - Mensajes con diferentes tipos (texto, imagen, audio, documento)
 * - Información de contactos asociados
 * - Timestamps realistas
 * - Estados de mensajes (SENT, DELIVERED, READ, FAILED)
 */

export interface Message {
  id: string
  body: string
  direction: 'INBOUND' | 'OUTBOUND'
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING'
  sentAt: string
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

/**
 * ─── Mock Contacts ──────────────────────────────────────────────────────────
 */

export const mockContacts: Record<string, ContactInfo> = {
  'contact_1': {
    id: 'contact_1',
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    phone: '+5491123456789'
  },
  'contact_2': {
    id: 'contact_2',
    name: 'María García',
    email: 'maria.garcia@example.com',
    phone: '+5491187654321'
  },
  'contact_3': {
    id: 'contact_3',
    name: 'Carlos López',
    email: 'carlos.lopez@example.com',
    phone: '+5491165432187'
  },
  'contact_4': {
    id: 'contact_4',
    name: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    phone: '+5491123456789'
  },
  'contact_5': {
    id: 'contact_5',
    name: 'Roberto Sánchez',
    email: 'roberto.sanchez@example.com',
    phone: '+5491198765432'
  },
  'contact_6': {
    id: 'contact_6',
    name: 'Laura Torres',
    email: 'laura.torres@example.com',
    phone: '+5491155443322'
  },
  'contact_7': {
    id: 'contact_7',
    name: 'Diego Fernández',
    email: 'diego.fernandez@example.com',
    phone: '+5491166778899'
  },
  'contact_8': {
    id: 'contact_8',
    name: 'Sofia Rodríguez',
    email: 'sofia.rodriguez@example.com',
    phone: '+5491144335566'
  },
}

/**
 * ─── Mock Messages ─────────────────────────────────────────────────────────
 */

export const mockMessages: Record<string, Message[]> = {
  'conversation_1': [
    {
      id: 'msg_1',
      body: 'Hola, quería preguntar sobre los planes de TechCorp',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 09:30:00',
      type: 'text'
    },
    {
      id: 'msg_2',
      body: 'Claro Juan, tenemos varios planes disponibles. ¿Cuáles son tus necesidades?',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-20 09:35:00',
      type: 'text'
    },
    {
      id: 'msg_3',
      body: 'Necesitamos mejorar nuestro sitio web y agregar funcionalidades de CRM',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 09:40:00',
      type: 'text'
    },
    {
      id: 'msg_4',
      body: 'Perfecto, te envío una propuesta con opciones personalizadas',
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      sentAt: '2024-01-20 10:00:00',
      type: 'text'
    },
    {
      id: 'msg_5',
      body: 'Aquí va la propuesta',
      direction: 'OUTBOUND',
      status: 'SENT',
      sentAt: '2024-01-20 10:05:00',
      type: 'document',
      mediaUrl: 'https://example.com/proposal.pdf',
      caption: 'Propuesta TechCorp - Enero 2024'
    },
  ],
  'conversation_2': [
    {
      id: 'msg_21',
      body: 'Hola, ¿en qué puedo ayudarte?',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-20 14:00:00',
      type: 'text'
    },
    {
      id: 'msg_22',
      body: 'Estoy interesada en conocer más sobre vuestros servicios',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 14:05:00',
      type: 'text'
    },
    {
      id: 'msg_23',
      body: 'Con gusto. ¿Cuál es tu área principal de interés?',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-20 14:10:00',
      type: 'text'
    },
    {
      id: 'msg_24',
      body: 'Principalmente desarrollo web y aplicaciones móviles',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 14:15:00',
      type: 'text'
    },
  ],
  'conversation_3': [
    {
      id: 'msg_31',
      body: 'Buenos días, necesito ayuda con mi equipo',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:30:00',
      type: 'text'
    },
    {
      id: 'msg_32',
      body: 'Claro Carlos, ¿qué problema tiene?',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:35:00',
      type: 'text'
    },
    {
      id: 'msg_33',
      body: 'La pantalla no prende y hace ruidos extraños',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:40:00',
      type: 'text'
    },
    {
      id: 'msg_34',
      body: '📸 Aquí va una foto del equipo',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:45:00',
      type: 'image',
      mediaUrl: 'https://via.placeholder.com/300x400?text=Computer',
      caption: 'Mi PC con problema'
    },
    {
      id: 'msg_35',
      body: 'Parece ser un problema de fuente de poder. Podemos hacer una evaluación presencial',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:50:00',
      type: 'text'
    },
    {
      id: 'msg_36',
      body: '¿Cuándo podrías venir?',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:55:00',
      type: 'text'
    },
    {
      id: 'msg_37',
      body: 'Este lunes 22 a las 10am te vendría bien?',
      direction: 'OUTBOUND',
      status: 'SENT',
      sentAt: '2024-01-20 09:00:00',
      type: 'text'
    },
  ],
  'conversation_4': [
    {
      id: 'msg_41',
      body: 'Quería consultar sobre planes de coaching',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-19 16:00:00',
      type: 'text'
    },
    {
      id: 'msg_42',
      body: 'Excelente Ana, tenemos varios paquetes disponibles',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-19 16:05:00',
      type: 'text'
    },
    {
      id: 'msg_43',
      body: 'Te comparto la información de precios',
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      sentAt: '2024-01-19 16:10:00',
      type: 'document',
      mediaUrl: 'https://example.com/pricing.pdf',
      caption: 'Planes de Coaching 2024'
    },
  ],
  'conversation_5': [
    {
      id: 'msg_51',
      body: 'Hola, necesito soporte técnico',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-18 11:00:00',
      type: 'text'
    },
    {
      id: 'msg_52',
      body: 'Hola Roberto, ¿cuál es el problema?',
      direction: 'OUTBOUND',
      status: 'FAILED',
      sentAt: '2024-01-18 11:05:00',
      type: 'text'
    },
    {
      id: 'msg_53',
      body: 'Hola Roberto, ¿cuál es el problema? (reintento)',
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      sentAt: '2024-01-18 11:10:00',
      type: 'text'
    },
  ],
  'conversation_6': [
    {
      id: 'msg_61',
      body: '🎉 ¡Felicidades por tu compra! Aquí va tu factura',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-17 15:00:00',
      type: 'document',
      mediaUrl: 'https://example.com/invoice.pdf',
      caption: 'Factura #INV-001'
    },
    {
      id: 'msg_62',
      body: 'Muchas gracias, muy rápido el servicio!',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-17 15:05:00',
      type: 'text'
    },
  ],
  'conversation_7': [
    {
      id: 'msg_71',
      body: 'Hola Diego, ¿cómo estás?',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-16 10:00:00',
      type: 'text'
    },
    {
      id: 'msg_72',
      body: 'Bien, ¿qué necesitas?',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-16 10:05:00',
      type: 'text'
    },
  ],
  'conversation_8': [
    {
      id: 'msg_81',
      body: 'Buenos días Sofia 🌟',
      direction: 'OUTBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:00:00',
      type: 'text'
    },
    {
      id: 'msg_82',
      body: 'Buenos días! ¿Cómo estás?',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:05:00',
      type: 'text'
    },
    {
      id: 'msg_83',
      body: '🎤 Aquí va un audio con más detalles sobre el proyecto',
      direction: 'OUTBOUND',
      status: 'DELIVERED',
      sentAt: '2024-01-20 08:10:00',
      type: 'audio',
      mediaUrl: 'https://example.com/audio.m4a',
      mimeType: 'audio/mp4',
      caption: 'Detalles del proyecto'
    },
    {
      id: 'msg_84',
      body: 'Perfecto, lo escucho ahora',
      direction: 'INBOUND',
      status: 'READ',
      sentAt: '2024-01-20 08:15:00',
      type: 'text'
    },
  ],
}

/**
 * ─── Mock Conversations ────────────────────────────────────────────────────
 */

export const mockConversations: Conversation[] = [
  {
    id: 'conversation_1',
    contactId: 'contact_1',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-20 10:05:00',
    messageCount: 5
  },
  {
    id: 'conversation_2',
    contactId: 'contact_2',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-20 14:15:00',
    messageCount: 4
  },
  {
    id: 'conversation_3',
    contactId: 'contact_3',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-20 09:00:00',
    messageCount: 7
  },
  {
    id: 'conversation_4',
    contactId: 'contact_4',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-19 16:10:00',
    messageCount: 3
  },
  {
    id: 'conversation_5',
    contactId: 'contact_5',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-18 11:10:00',
    messageCount: 3
  },
  {
    id: 'conversation_6',
    contactId: 'contact_6',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-17 15:05:00',
    messageCount: 2
  },
  {
    id: 'conversation_7',
    contactId: 'contact_7',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-16 10:05:00',
    messageCount: 2
  },
  {
    id: 'conversation_8',
    contactId: 'contact_8',
    channel: 'WHATSAPP',
    lastMessageAt: '2024-01-20 08:15:00',
    messageCount: 4
  },
]

/**
 * ─── Mock Lock Status ──────────────────────────────────────────────────────
 */

export const mockLockStatus: Record<string, LockStatus> = {
  'conversation_1': {
    isAttending: true,
    agentId: 'agent_001',
    agentName: 'Juan (Yo)'
  },
  'conversation_2': {
    isAttending: false
  },
  'conversation_3': {
    isAttending: true,
    agentId: 'agent_002',
    agentName: 'María García'
  },
  'conversation_4': {
    isAttending: false
  },
  'conversation_5': {
    isAttending: false
  },
  'conversation_6': {
    isAttending: false
  },
  'conversation_7': {
    isAttending: false
  },
  'conversation_8': {
    isAttending: true,
    agentId: 'agent_001',
    agentName: 'Juan (Yo)'
  },
}

/**
 * ─── Helper Functions ──────────────────────────────────────────────────────
 */

/**
 * Obtiene una conversación específica con sus detalles
 */
export function getConversationWithDetails(conversationId: string) {
  const conversation = mockConversations.find(c => c.id === conversationId)
  if (!conversation) return null

  const contact = mockContacts[conversation.contactId]
  const messages = mockMessages[conversationId] || []
  const lockStatus = mockLockStatus[conversationId] || { isAttending: false }

  return {
    conversation,
    contact,
    messages,
    lockStatus
  }
}

/**
 * Obtiene todas las conversaciones con sus contactos
 */
export function getAllConversationsWithContacts() {
  return mockConversations.map(conv => ({
    ...conv,
    contact: mockContacts[conv.contactId],
    messageCount: (mockMessages[conv.id] || []).length,
    lastMessage: (mockMessages[conv.id] || [])[(mockMessages[conv.id] || []).length - 1]
  }))
}

/**
 * Busca conversaciones por nombre de contacto
 */
export function searchConversations(query: string) {
  const lowerQuery = query.toLowerCase()
  return mockConversations.filter(conv => {
    const contact = mockContacts[conv.contactId]
    return (
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.email?.toLowerCase().includes(lowerQuery) ||
      contact.phone?.includes(query)
    )
  })
}

/**
 * Obtiene conversaciones activas (siendo atendidas)
 */
export function getActiveConversations() {
  return mockConversations.filter(conv => {
    const status = mockLockStatus[conv.id]
    return status?.isAttending
  })
}

/**
 * Obtiene conversaciones sin atender
 */
export function getUnattendedConversations() {
  return mockConversations.filter(conv => {
    const status = mockLockStatus[conv.id]
    return !status?.isAttending
  })
}
