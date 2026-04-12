export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  message: string
  timestamp: Date
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    message: 'Nuevo lead registrado: TechCorp ($2,500)',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'success',
    message: 'Deal cerrado exitosamente: StartupXYZ',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '3',
    type: 'warning',
    message: 'Tarea vencida: Llamar a Roberto (hace 2 horas)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    type: 'info',
    message: 'Nueva cita agendada: Juan Pérez - 10:00 AM',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '5',
    type: 'error',
    message: 'Mensaje sin responder: Cliente nuevo (5 min)',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '6',
    type: 'success',
    message: 'Contacto actualizado: María García',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: '7',
    type: 'info',
    message: 'Nuevo mensaje de WhatsApp recibido',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '8',
    type: 'warning',
    message: 'Presupuesto PC Gamer requiere aprobación',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
]
