export const WHATSAPP_FILTER_OPTIONS = [
  { id: 'all', label: 'Todas las conversaciones' },
  { id: 'unread', label: 'No leídos' },
  { id: 'active', label: 'Activos' },
  { id: 'archived', label: 'Archivados' },
] as const

export type WhatsAppFilterId = typeof WHATSAPP_FILTER_OPTIONS[number]['id']