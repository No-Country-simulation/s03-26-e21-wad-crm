import { useState, useEffect } from 'react';
import { tasksService } from '../services/api';
import { Plus, CheckCircle, Circle, Clock, ListTodo, AlertCircle } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueAt: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksService.getAll();
      setTasks(response.data.content || response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        dueAt: formData.dueAt ? new Date(formData.dueAt).toISOString() : null
      };
      await tasksService.create(data);
      setFormData({ title: '', description: '', priority: 'MEDIUM', dueAt: '' });
      setShowForm(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Make sure you have a contact to link to.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await tasksService.complete(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'HIGH': return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', label: 'bg-red-100 text-red-700' };
      case 'MEDIUM': return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', label: 'bg-yellow-100 text-yellow-700' };
      case 'LOW': return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', label: 'bg-green-100 text-green-700' };
      case 'URGENT': return { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', label: 'bg-purple-100 text-purple-700' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700', label: 'bg-gray-100 text-gray-700' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ListTodo className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Tareas</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          Nueva Tarea
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Crear Nueva Tarea</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titulo</label>
                <input
                  type="text"
                  placeholder="Ej: Llamar a cliente"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Limite</label>
                <input
                  type="datetime-local"
                  value={formData.dueAt}
                  onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripcion</label>
              <textarea
                placeholder="Agregar detalles adicionales..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-gray-800 placeholder-gray-400 resize-none"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-sm font-medium text-gray-700">Prioridad:</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-gray-800"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                Guardar Tarea
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando tareas...</p>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Circle size={20} className="text-blue-600" />
              Pendientes ({pendingTasks.length})
            </h2>
            {pendingTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No hay tareas pendientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingTasks.map((task) => {
                  const config = getPriorityConfig(task.priority);
                  const overdue = isOverdue(task.dueAt);
                  return (
                    <div 
                      key={task.id}
                      className={`${config.bg} border-2 ${config.border} rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative`}
                    >
                      {overdue && (
                        <div className="absolute top-3 right-3">
                          <AlertCircle className="text-red-500" size={18} />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleComplete(task.id)}
                          className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Circle size={22} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{task.title}</h3>
                          {task.description && (
                            <p className={`text-sm mt-1 line-clamp-2 ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.label}`}>
                              {task.priority}
                            </span>
                            {task.dueAt && (
                              <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                <Clock size={12} />
                                {formatDate(task.dueAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <CheckCircle size={20} className="text-green-600" />
              Completadas ({completedTasks.length})
            </h2>
            {completedTasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
                <p className="text-gray-400">No hay tareas completadas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {completedTasks.map((task) => {
                  const config = getPriorityConfig(task.priority);
                  return (
                    <div 
                      key={task.id}
                      className={`${config.bg} border-2 ${config.border} rounded-xl p-5 shadow-sm relative`}
                    >
                      <div className="flex items-start gap-3">
                        <button className="mt-1 text-green-600">
                          <CheckCircle size={22} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-500 line-through truncate">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm mt-1 text-gray-400 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.label}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
