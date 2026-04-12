import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Calendar, Clock, Video, MapPin, Phone } from 'lucide-react'
import { STATUS_COLORS } from '@/shared/constants/colorMaps'
import type { AppointmentCardProps } from '../types'
import { STATUS_LABELS, TYPE_LABELS } from '../types'

const TYPE_ICONS = {
  VIRTUAL: Video,
  PRESENTIAL: MapPin,
  PHONE: Phone,
}

export function AppointmentCard({ appointment, formatDateTime }: AppointmentCardProps) {
  const TypeIcon = TYPE_ICONS[appointment.appointmentType]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{appointment.title}</CardTitle>
            {appointment.description && (
              <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[appointment.status]}`}>
            {STATUS_LABELS[appointment.status]}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(appointment.scheduledStart)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>{appointment.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <TypeIcon className="w-4 h-4" />
            <span>{TYPE_LABELS[appointment.appointmentType]}</span>
          </div>
        </div>

        {appointment.meetingUrl && (
          <div className="flex items-center gap-2">
            <a
              href={appointment.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Unirse a la reunión
            </a>
          </div>
        )}

        {appointment.status === 'CANCELLED' && appointment.cancelReason && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">
              <span className="font-medium">Motivo de cancelación:</span> {appointment.cancelReason}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t">
          {appointment.contactId && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Contacto: {appointment.contactId}
            </span>
          )}
          {appointment.assignedToUserId && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Asignado a: {appointment.assignedToUserId}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
