import { Notification } from './types'
import { TabKey } from '@/types'

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    message: 'Nuevo mensaje de WhatsApp recibido',
    section: 'whatsapp' as TabKey,
  },
  {
    id: '2',
    type: 'success',
    message: 'Contacto guardado exitosamente',
    section: 'contacts' as TabKey,
  },
  {
    id: '3',
    type: 'warning',
    message: 'Email no entregado - reintentar',
    section: 'email' as TabKey,
  },
  {
    id: '4',
    type: 'info',
    message: 'Recordatorio: Reunión en 30 minutos',
    section: 'calendar' as TabKey,
  },
  {
    id: '5',
    type: 'error',
    message: 'Error de conexión con WhatsApp',
    section: 'settings' as TabKey,
  },
  {
    id: '6',
    type: 'success',
    message: 'Campaña de email enviada',
    section: 'metrics' as TabKey,
  },
]
