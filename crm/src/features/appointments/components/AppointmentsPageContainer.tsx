import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { Plus } from 'lucide-react'
import { useAppointments } from '../hooks/useAppointments'
import { AppointmentCard } from './AppointmentCard'

export function AppointmentsPageContainer() {
  const {
    appointments,
    isLoading,
    view,
    setView,
    formatDateTime,
  } = useAppointments()

  if (isLoading) {
    return <LoadingSpinner show={true} />
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="Citas" 
        subtitle={`${appointments.length} citas programadas`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView(view === 'list' ? 'calendar' : 'list')}>
              {view === 'list' ? 'Vista Calendario' : 'Vista Lista'}
            </Button>
            <Button>
              <Plus className="w-4 h-4" />
              Nueva Cita
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            formatDateTime={formatDateTime}
          />
        ))}
      </div>

      {appointments.length === 0 && (
        <EmptyState message="No hay citas programadas" />
      )}
    </div>
  )
}
