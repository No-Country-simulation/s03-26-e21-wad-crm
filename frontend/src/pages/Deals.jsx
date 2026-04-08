import { useState, useEffect } from 'react';
import { dealsService } from '../services/api';
import { Plus, Search } from 'lucide-react';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => { loadDeals(); }, []);

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

  const filtered = deals.filter(d => d.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64" style={{ background: 'var(--color-bg)' }}>
      <div className="text-lg" style={{ color: 'var(--color-muted)' }}>Cargando...</div>
    </div>
  );

  if (error) return (
    <div className="p-6" style={{ background: 'var(--color-bg)' }}>
      <div className="px-4 py-3 rounded-lg" style={{ background: '#2d0a0a', border: '1px solid #7f1d1d', color: '#fca5a5' }}>
        <p className="font-bold">Error</p><p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Deals</h1>
        <button className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
          <Plus size={18} /> New Deal
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-muted)' }} />
          <input type="text" placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>No deals found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((deal) => (
            <div key={deal.id} className="p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{deal.name}</h3>
              <p className="text-2xl font-bold mt-2" style={{ color: 'var(--color-accent)' }}>
                ${deal.value?.toLocaleString() || '0'}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{deal.stageName || 'Sin etapa'}</span>
                <span className="px-2 py-1 text-xs rounded-full" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                  {deal.priority || 'MEDIUM'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
