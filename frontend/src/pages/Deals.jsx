import { useState, useEffect } from 'react';
import { dealsService, contactsService } from '../services/api';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';

const inp = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({ name: '', value: '', contactId: '', assignedTo: '' });

  useEffect(() => { loadDeals(); loadContacts(); }, []);

  const loadDeals = async () => {
    try {
      const response = await dealsService.getAll();
      const data = response.data.content || response.data;
      setDeals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const r = await contactsService.getAll();
      setContacts(r.data.content || r.data || []);
    } catch (e) {
      setContacts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        value: formData.value ? parseFloat(formData.value) : 0,
        contactId: formData.contactId,
      };
      if (editingDeal) {
        await dealsService.update(editingDeal.id, payload);
      } else {
        await dealsService.create(payload);
      }
      resetForm();
      loadDeals();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al guardar deal');
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name,
      value: deal.value?.toString() || '',
      contactId: deal.contactId || '',
      assignedTo: deal.assignedTo || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este deal?')) return;
    try {
      await dealsService.delete(id);
      loadDeals();
    } catch (err) {
      alert('Error al eliminar deal');
    }
  };

  const resetForm = () => {
    setEditingDeal(null);
    setFormData({ name: '', value: '', contactId: '', assignedTo: '' });
    setShowForm(false);
  };

  const filtered = deals.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64" style={{ background: 'var(--color-bg)' }}>
      <div className="text-lg" style={{ color: 'var(--color-muted)' }}>Cargando...</div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Deals</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
          <Plus size={18} /> New Deal
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {editingDeal ? 'Edit Deal' : 'New Deal'}
            </h2>
            <button onClick={resetForm} className="p-1 rounded" style={{ color: 'var(--color-muted)' }}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Nombre del Deal</label>
                <input type="text" placeholder="Ej: Venta Premium" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none" style={inp} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Valor ($)</label>
                <input type="number" placeholder="0.00" value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg focus:outline-none" style={inp} min="0" step="0.01" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Contacto</label>
              <select value={formData.contactId} onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg focus:outline-none" style={inp} required>
                <option value="">Selecciona un contacto</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" className="px-8 py-3 rounded-lg font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
              {editingDeal ? 'Guardar Cambios' : 'Crear Deal'}
            </button>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-muted)' }} />
          <input type="text" placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg mb-6" style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', color: '#fca5a5' }}>
          <p className="font-bold">Error</p><p>{error}</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>No deals found</p>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Create your first deal to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((deal) => (
            <div key={deal.id} className="p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{deal.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(deal)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(deal.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                ${deal.value?.toLocaleString() || '0'}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{deal.stage?.name || 'Sin etapa'}</span>
                <span className="px-2 py-1 text-xs rounded-full" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                  {deal.stage?.isWon ? 'GANADO' : deal.stage?.isLost ? 'PERDIDO' : 'ABIERTO'}
                </span>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Creado: {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
        Total: {filtered.length} deal{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
