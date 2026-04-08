import { useState, useEffect } from 'react';
import { contactsService, tasksService } from '../services/api';
import { Plus, CheckCircle, Circle, Clock, ListTodo, AlertCircle } from 'lucide-react';

const inp = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

const PRIORITY = {
  HIGH:   { bg: '#dc262622', border: '#dc2626', text: '#dc2626' },
  MEDIUM: { bg: '#d9770622', border: '#d97706', text: '#d97706' },
  LOW:    { bg: '#16a34a22', border: '#16a34a', text: '#16a34a' },
  URGENT: { bg: '#7c3aed22', border: '#7c3aed', text: '#7c3aed' },
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', dueAt: '', contactId: '' });

  useEffect(() => { loadTasks(); loadContacts(); }, []);

  const loadTasks = async () => {
    try { const r = await tasksService.getAll(); setTasks(r.data.content || r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadContacts = async () => {
    try { const r = await contactsService.getAll(); setContacts(r.data.content || r.data || []); }
    catch (e) { setContacts([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tasksService.create({ ...formData, dueAt: new Date(formData.dueAt).toISOString() });
      setFormData({ title: '', description: '', priority: 'MEDIUM', dueAt: '', contactId: '' });
      setShowForm(false);
      loadTasks();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleComplete = async (id) => {
    try { await tasksService.complete(id); loadTasks(); } catch (e) { console.error(e); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha';
  const isOverdue = (d) => d && new Date(d) < new Date();

  const pending   = tasks.filter(t => !t.isCompleted);
  const completed = tasks.filter(t => t.isCompleted);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--color-primary)' }}>
            <ListTodo className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Tareas</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
          <Plus size={20} /> Nueva Tarea
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Crear Nueva Tarea</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Titulo</label>
                <input type="text" placeholder="Ej: Llamar a cliente" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none" style={inp} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Fecha Limite</label>
                <input type="datetime-local" value={formData.dueAt}
                  onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none" style={inp} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Contacto</label>
              <select value={formData.contactId} onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:outline-none" style={inp} required>
                <option value="">Selecciona un contacto</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Descripcion</label>
              <textarea placeholder="Detalles adicionales..." value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:outline-none resize-none" style={inp} rows={2} />
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Prioridad:</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="px-4 py-2 rounded-lg focus:outline-none" style={inp}>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
              <button type="submit" className="px-6 py-2 rounded-lg font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                Guardar Tarea
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p className="mt-2" style={{ color: 'var(--color-muted)' }}>Cargando tareas...</p>
        </div>
      ) : (
        <>
          <TaskSection title="Pendientes" count={pending.length} icon={<Circle size={20} style={{ color: 'var(--color-accent)' }} />}>
            {pending.map((task) => {
              const p = PRIORITY[task.priority] || PRIORITY.MEDIUM;
              const overdue = isOverdue(task.dueAt);
              return (
                <div key={task.id} className="rounded-xl p-5 relative" style={{ background: p.bg, border: `2px solid ${p.border}` }}>
                  {overdue && <AlertCircle className="absolute top-3 right-3 text-red-500" size={18} />}
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleComplete(task.id)} className="mt-1" style={{ color: 'var(--color-muted)' }}>
                      <Circle size={22} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{task.title}</h3>
                      {task.description && <p className="text-sm mt-1 line-clamp-2" style={{ color: overdue ? '#f87171' : 'var(--color-muted)' }}>{task.description}</p>}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full" style={{ background: p.bg, color: p.text, border: `1px solid ${p.border}` }}>{task.priority}</span>
                        {task.dueAt && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: overdue ? '#f87171' : 'var(--color-muted)' }}>
                            <Clock size={12} />{formatDate(task.dueAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TaskSection>

          <TaskSection title="Completadas" count={completed.length} icon={<CheckCircle size={20} style={{ color: '#16a34a' }} />}>
            {completed.map((task) => (
              <div key={task.id} className="rounded-xl p-5 opacity-60" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start gap-3">
                  <CheckCircle size={22} style={{ color: '#16a34a', marginTop: 2 }} />
                  <div>
                    <h3 className="font-semibold line-through" style={{ color: 'var(--color-muted)' }}>{task.title}</h3>
                    {task.description && <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--color-muted)' }}>{task.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </TaskSection>
        </>
      )}
    </div>
  );
}

function TaskSection({ title, count, icon, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
        {icon} {title} ({count})
      </h2>
      {count === 0 ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-muted)' }}>No hay tareas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
      )}
    </div>
  );
}
