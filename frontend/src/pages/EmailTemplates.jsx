import { useState, useEffect } from 'react';
import { emailTemplateService } from '../services/api';
import { Plus, Edit2, Trash2, Mail, Search, Check } from 'lucide-react';

const CATEGORIES = {
  WELCOME:   { label: 'Bienvenida',    color: '#16a34a' },
  FOLLOW_UP: { label: 'Seguimiento',   color: '#2563eb' },
  PROPOSAL:  { label: 'Propuesta',     color: '#7c3aed' },
  CLOSING:   { label: 'Cierre',        color: '#d97706' },
  MEETING:   { label: 'Reunión',       color: '#0891b2' },
  CUSTOM:    { label: 'Personalizado', color: '#6b7280' },
};

const inp = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', subject: '', body: '', description: '', category: 'CUSTOM', isDefault: false });

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try { const r = await emailTemplateService.getAll(); setTemplates(r.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = templates.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) await emailTemplateService.update(editingTemplate.id, formData);
      else await emailTemplateService.create(formData);
      setShowModal(false); setEditingTemplate(null); resetForm(); loadTemplates();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (t) => {
    setEditingTemplate(t);
    setFormData({ name: t.name, subject: t.subject, body: t.body, description: t.description || '', category: t.category, isDefault: t.isDefault });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    try { await emailTemplateService.delete(id); loadTemplates(); } catch (e) { console.error(e); }
  };

  const resetForm = () => setFormData({ name: '', subject: '', body: '', description: '', category: 'CUSTOM', isDefault: false });

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ background: 'var(--color-bg)' }}>
      <div className="animate-spin text-4xl" style={{ color: 'var(--color-accent)' }}>⟳</div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Email Templates</h1>
        <button onClick={() => { resetForm(); setEditingTemplate(null); setShowModal(true); }}
          className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
          <Plus size={18} /> Nueva Plantilla
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-muted)' }} />
          <input type="text" placeholder="Buscar plantillas..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none" style={inp} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>
          <Mail size={48} className="mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
          <p>No se encontraron plantillas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => {
            const cat = CATEGORIES[t.category] || CATEGORIES.CUSTOM;
            return (
              <div key={t.id} className="p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={18} style={{ color: 'var(--color-muted)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{t.name}</h3>
                    {t.isDefault && (
                      <span className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1" style={{ background: '#16a34a22', color: '#4ade80' }}>
                        <Check size={12} /> Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(t)} className="p-1.5 transition-colors" style={{ color: 'var(--color-muted)' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 transition-colors" style={{ color: 'var(--color-muted)' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--color-muted)' }}>{t.subject}</p>
                <span className="inline-block px-2 py-1 text-xs rounded-full" style={{ background: cat.color + '22', color: cat.color }}>
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: '#00000088' }}>
          <div className="rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { label: 'Nombre',      key: 'name',        type: 'text' },
                { label: 'Asunto',      key: 'subject',     type: 'text' },
                { label: 'Descripción', key: 'description', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>{label}</label>
                  <input type={type} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required={key !== 'description'} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Categoría</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp}>
                  {Object.entries(CATEGORIES).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Cuerpo del Email (HTML)
                  <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-muted)' }}>Variables: {'{{contact_name}}'}, {'{{company_name}}'}</span>
                </label>
                <textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={10} className="w-full px-4 py-2 rounded-lg focus:outline-none font-mono text-sm" style={inp} required />
              </div>
              <label className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} className="w-4 h-4" />
                Establecer como plantilla por defecto
              </label>
              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => { setShowModal(false); setEditingTemplate(null); resetForm(); }}
                  className="px-4 py-2" style={{ color: 'var(--color-muted)' }}>Cancelar</button>
                <button type="submit" className="px-6 py-2 rounded-lg font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
                  {editingTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
