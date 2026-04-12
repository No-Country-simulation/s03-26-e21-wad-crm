import { useEffect, useState } from 'react'
import { useAppointmentsStore } from '../store'
import type { AppointmentView } from '../types'

export function useAppointments() {
  const { appointments, isLoading, fetchAppointments } = useAppointmentsStore()
  const [view, setView] = useState<AppointmentView>('list')

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
  )

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    appointments: sortedAppointments,
    isLoading,
    view,
    setView,
    formatDateTime,
  }
}
