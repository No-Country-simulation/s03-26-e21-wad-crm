import { useState, useEffect } from 'react';
import { dealsService } from '../services/api';
import { Plus, Search } from 'lucide-react';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    try {
      const response = await dealsService.getAll();
      // Handle Page response (Spring Data Page)
      const dealsData = response.data.content || response.data;
      setDeals(Array.isArray(dealsData) ? dealsData : []);
    } catch (err) {
      console.error('Failed to load deals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal =>
    deal.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Deals</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} />
          New Deal
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredDeals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No deals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => (
            <div key={deal.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <h3 className="font-semibold text-gray-800">{deal.name}</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                ${deal.value?.toLocaleString() || '0'}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">{deal.stageName || 'Sin etapa'}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  deal.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                  deal.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
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
