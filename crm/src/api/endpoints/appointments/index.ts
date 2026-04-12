import { apiClient } from '../../client'

export interface Appointment {
  id: string
  workspaceId: string
  contactId?: string
  assignedToUserId?: string
  title: string
  description?: string
  appointmentType: 'VIRTUAL' | 'PRESENTIAL' | 'PHONE'
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  scheduledStart: string
  scheduledEnd: string
  durationMinutes: number
  meetingUrl?: string
  meetingId?: string
  createdBy?: string
  cancelledAt?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export const appointmentsApi = {
  getAll: async () => {
    const { data } = await apiClient.get<Appointment[]>('/appointments')
    return data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Appointment>(`/appointments/${id}`)
    return data
  },

  create: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data } = await apiClient.post<Appointment>('/appointments', appointment)
    return data
  },

  update: async (id: string, appointment: Partial<Appointment>) => {
    const { data } = await apiClient.patch<Appointment>(`/appointments/${id}`, appointment)
    return data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/appointments/${id}`)
  },

  cancel: async (id: string, reason: string) => {
    return appointmentsApi.update(id, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    })
  },
}
