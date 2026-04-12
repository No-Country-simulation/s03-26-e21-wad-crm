import { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/store';

interface Appointment {
  id: string;
  title: string;
  contactName: string;
  type: 'VIRTUAL' | 'PRESENTIAL' | 'PHONE';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  scheduledStart: string;
  scheduledEnd: string;
  duration: number;
  meetingUrl?: string;
  notes?: string;
}

const TYPE_ICONS = {
  VIRTUAL: '📹',
  PRESENTIAL: '🏢',
  PHONE: '📞'
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700'
};

export function Appointments() {
  const { hasPermission } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setAppointments([
      { id: '1', title: 'Consulta gratuita', contactName: 'Juan Pérez', type: 'VIRTUAL', status: 'CONFIRMED', scheduledStart: '2024-01-20T10:00:00', scheduledEnd: '2024-01-20T10:30:00', duration: 30, meetingUrl: 'https://meet.google.com/abc-defg-hij' },
      { id: '2', title: 'Sesión coaching', contactName: 'María García', type: 'VIRTUAL', status: 'PENDING', scheduledStart: '2024-01-20T15:00:00', scheduledEnd: '2024-01-20T15:50:00', duration: 50 },
      { id: '3', title: 'Diagnóstico PC', contactName: 'Carlos López', type: 'PRESENTIAL', status: 'CONFIRMED', scheduledStart: '2024-01-21T09:00:00', scheduledEnd: '2024-01-21T10:00:00', duration: 60, notes: 'Traer equipo' },
      { id: '4', title: 'Llamada de seguimiento', contactName: 'Ana Martínez', type: 'PHONE', status: 'COMPLETED', scheduledStart: '2024-01-18T11:00:00', scheduledEnd: '2024-01-18T11:15:00', duration: 15 },
      { id: '5', title: 'Demo de producto', contactName: 'Roberto Sánchez', type: 'VIRTUAL', status: 'PENDING', scheduledStart: '2024-01-22T14:00:00', scheduledEnd: '2024-01-22T15:00:00', duration: 60, meetingUrl: 'https://zoom.us/j/123456789' },
    ]);
  }, []);

  const canWrite = hasPermission('appointments:write');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDay = (day: Date | null) => {
    if (!day) return [];
    return appointments.filter(a => {
      const apptDate = new Date(a.scheduledStart);
      return apptDate.toDateString() === day.toDateString();
    });
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Citas</h1>
          <p className="text-gray-500">{appointments.length} citas programadas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Calendario
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            Lista
          </button>
          {canWrite && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Nueva Cita
            </button>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between p-4 border-b">
            <button 
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <h2 className="text-lg font-semibold">
              {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h2>
            <button 
              onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
                {day}
              </div>
            ))}
            {getDaysInMonth(selectedDate).map((day, idx) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isToday = day && day.toDateString() === new Date().toDateString();
              return (
                <div 
                  key={idx} 
                  className={`min-h-[100px] p-2 border ${isToday ? 'bg-blue-50' : ''} ${!day ? 'bg-gray-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1 mt-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div 
                            key={apt.id} 
                            className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200"
                          >
                            {formatTime(apt.scheduledStart)} {apt.title}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500">+{dayAppointments.length - 2} más</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Título</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Hora</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appointments.map(apt => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{apt.title}</td>
                  <td className="px-4 py-3 text-gray-600">{apt.contactName}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1">
                      {TYPE_ICONS[apt.type]} {apt.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatTime(apt.scheduledStart)} - {formatTime(apt.scheduledEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[apt.status]}`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}