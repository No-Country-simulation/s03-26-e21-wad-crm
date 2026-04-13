import type { WhatsAppConversation } from './types'

export const MOCK_WHATSAPP_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    lastMessage: 'Perfecto, quedo atento al presupuesto',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'María García',
    lastMessage: '¿Podemos agendar una llamada para mañana?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    name: 'TechCorp S.A.',
    lastMessage: 'Gracias por la información',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '4',
    name: 'Carlos López',
    lastMessage: 'Voy a revisar el contrato y te aviso',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Ana Martínez',
    lastMessage: '¿Tienen disponibilidad para esta semana?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '6',
    name: 'StartupXYZ',
    lastMessage: 'Confirmado para el viernes',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    unreadCount: 0,
    isOnline: false,
  },
]