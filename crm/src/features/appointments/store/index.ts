import { create } from 'zustand'
import { appointmentsApi, type Appointment } from '@/api/endpoints/appointments'

interface AppointmentsState {
  appointments: Appointment[]
  isLoading: boolean
  error: string | null
  selectedAppointment: Appointment | null
  
  fetchAppointments: () => Promise<void>
  getAppointmentById: (id: string) => Promise<void>
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  cancelAppointment: (id: string, reason: string) => Promise<void>
  setSelectedAppointment: (appointment: Appointment | null) => void
}

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: [],
  isLoading: false,
  error: null,
  selectedAppointment: null,

  fetchAppointments: async () => {
    set({ isLoading: true, error: null })
    try {
      const appointments = await appointmentsApi.getAll()
      set({ appointments, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  getAppointmentById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const appointment = await appointmentsApi.getById(id)
      set({ selectedAppointment: appointment, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createAppointment: async (appointment) => {
    set({ isLoading: true, error: null })
    try {
      const newAppointment = await appointmentsApi.create(appointment)
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateAppointment: async (id, appointment) => {
    set({ isLoading: true, error: null })
    try {
      const updatedAppointment = await appointmentsApi.update(id, appointment)
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? updatedAppointment : a)),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteAppointment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await appointmentsApi.delete(id)
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  cancelAppointment: async (id, reason) => {
    set({ isLoading: true, error: null })
    try {
      const cancelledAppointment = await appointmentsApi.cancel(id, reason)
      set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? cancelledAppointment : a)),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
}))
