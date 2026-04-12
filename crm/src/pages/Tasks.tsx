import { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/store';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  assignedTo?: string;
  contactName?: string;
  dealName?: string;
}

const PRIORITY_COLORS = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50'
};

const STATUS_LABELS = {
  pending: 'Por hacer',
  in_progress: 'En progreso',
  completed: 'Completada'
};

export function Tasks() {
  const { hasPermission } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');

  useEffect(() => {
    setTasks([
      { id: '1', title: 'Llamar a Roberto', description: 'Seguimiento de propuesta', priority: 'high', status: 'pending', dueDate: '2024-01-20', assignedTo: 'agent@nexo.com', contactName: 'Roberto Sánchez' },
      { id: '2', title: 'Enviar cotización a TechCorp', priority: 'high', status: 'in_progress', dueDate: '2024-01-21', dealName: 'Sitio web TechCorp' },
      { id: '3', title: 'Revisar presupuesto PC Gamer', priority: 'medium', status: 'pending', dueDate: '2024-01-22' },
      { id: '4', title: 'Completar diagnóstico PC #452', priority: 'high', status: 'in_progress', contactName: 'Juan Pérez' },
      { id: '5', title: 'Follow-up con cliente satisfecho', priority: 'low', status: 'pending', dueDate: '2024-01-25' },
      { id: '6', title: 'Preparar presentación', priority: 'medium', status: 'completed', dueDate: '2024-01-18' },
      { id: '7', title: 'Actualizar CRM', priority: 'low', status: 'completed', dueDate: '2024-01-15' },
    ]);
  }, []);

  const canWrite = hasPermission('tasks:write');
  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-500">{filteredTasks.length} tareas</p>
        </div>
        {canWrite && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Nueva Tarea
          </button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex gap-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {f === 'all' ? 'Todas' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setViewMode('board')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'board' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}
          >
            Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-sm ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}
          >
            Lista
          </button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['pending', 'in_progress', 'completed'] as const).map(status => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">{STATUS_LABELS[status]}</h3>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                  {tasksByStatus[status].length}
                </span>
              </div>
              <div className="space-y-3">
                {tasksByStatus[status].map(task => (
                  <div key={task.id} className="bg-white p-3 rounded-lg shadow-sm border">
                    <div className="flex items-start justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 mt-2">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      {task.contactName && <span>👤 {task.contactName}</span>}
                      {task.dueDate && <span>📅 {formatDate(task.dueDate)}</span>}
                    </div>
                  </div>
                ))}
                {canWrite && status === 'pending' && (
                  <button className="w-full py-2 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                    + Agregar tarea
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tarea</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Prioridad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Vencimiento</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Relacionado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{task.title}</div>
                    {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{STATUS_LABELS[task.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(task.dueDate)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {task.contactName || task.dealName || '-'}
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