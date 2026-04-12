import { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/store';

interface Deal {
  id: string;
  title: string;
  value: number;
  contactName: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  probability: number;
  expectedClose: string;
  assignedTo?: string;
}

const STAGES = [
  { id: 'new', label: 'Nuevo', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contactado', color: 'bg-yellow-500' },
  { id: 'qualified', label: 'Calificado', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Propuesta', color: 'bg-orange-500' },
  { id: 'won', label: 'Ganado', color: 'bg-green-500' },
  { id: 'lost', label: 'Perdido', color: 'bg-red-500' },
];

const STAGE_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export function Deals() {
  const { hasPermission } = useAuthStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  useEffect(() => {
    setDeals([
      { id: '1', title: 'Sitio web TechCorp', value: 5000, contactName: 'Juan Pérez', stage: 'proposal', probability: 60, expectedClose: '2024-02-15', assignedTo: 'agent@nexo.com' },
      { id: '2', title: 'Sistema inventario StartupXYZ', value: 8000, contactName: 'María García', stage: 'qualified', probability: 40, expectedClose: '2024-03-01', assignedTo: 'agent@nexo.com' },
      { id: '3', title: 'Consultoría marketing', value: 3000, contactName: 'Carlos López', stage: 'new', probability: 10, expectedClose: '2024-02-28' },
      { id: '4', title: 'App móvil proyecto', value: 15000, contactName: 'Ana Martínez', stage: 'contacted', probability: 20, expectedClose: '2024-04-15' },
      { id: '5', title: 'Mantenimiento anual', value: 2400, contactName: 'Roberto Sánchez', stage: 'won', probability: 100, expectedClose: '2024-01-20' },
      { id: '6', title: 'Diseño branding', value: 2000, contactName: 'Laura Torres', stage: 'lost', probability: 0, expectedClose: '2024-01-10' },
    ]);
  }, []);

  const canWrite = hasPermission('deals:write');
  const dealsByStage = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {} as Record<string, Deal[]>);

  const totalValue = deals.filter(d => d.stage !== 'lost' && d.stage !== 'won').reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="p-6 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500">Pipeline de ventas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Pipeline</p>
            <p className="text-lg font-bold text-blue-600">${totalValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Ganado</p>
            <p className="text-lg font-bold text-green-600">${wonValue.toLocaleString()}</p>
          </div>
          {canWrite && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Nuevo Deal
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('kanban')}
          className={`px-4 py-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Kanban
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Tabla
        </button>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.filter(s => s.id !== 'lost').map(stage => (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className={`px-3 py-2 rounded-t-lg ${stage.color}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{stage.label}</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded">
                    {dealsByStage[stage.id]?.length || 0}
                  </span>
                </div>
              </div>
              <div className="bg-gray-100 p-2 rounded-b-lg min-h-[400px] space-y-2">
                {dealsByStage[stage.id]?.map(deal => (
                  <div key={deal.id} className="bg-white p-3 rounded-lg shadow-sm border hover:shadow-md cursor-pointer">
                    <div className="font-medium text-gray-900">{deal.title}</div>
                    <div className="text-lg font-bold text-green-600 mt-1">${deal.value.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mt-1">{deal.contactName}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{deal.probability}%</span>
                      <span className="text-xs text-gray-400">{deal.expectedClose}</span>
                    </div>
                  </div>
                ))}
                {canWrite && (
                  <button className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 border-2 border-dashed border-gray-300 rounded-lg">
                    + Agregar Deal
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Deal</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Etapa</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Probabilidad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Cierre esperado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deals.map(deal => {
                const stage = STAGES.find(s => s.id === deal.stage);
                return (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{deal.title}</td>
                    <td className="px-4 py-3 text-gray-600">{deal.contactName}</td>
                    <td className="px-4 py-3 font-medium text-green-600">${deal.value.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${stage?.color}`}>
                        {stage?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{deal.probability}%</td>
                    <td className="px-4 py-3 text-gray-600">{deal.expectedClose}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}