export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type AppointmentType = 'VIRTUAL' | 'PRESENTIAL' | 'PHONE'
export type AppointmentView = 'list' | 'calendar'

export interface Appointment {
  id: string
  title: string
  description?: string
  scheduledStart: string
  durationMinutes: number
  appointmentType: AppointmentType
  status: AppointmentStatus
  meetingUrl?: string
  cancelReason?: string
  contactId?: string
  assignedToUserId?: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentCardProps {
  appointment: Appointment
  formatDateTime: (dateString: string) => string
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
}

export const TYPE_LABELS: Record<AppointmentType, string> = {
  VIRTUAL: 'Virtual',
  PRESENTIAL: 'Presencial',
  PHONE: 'Teléfono',
}
