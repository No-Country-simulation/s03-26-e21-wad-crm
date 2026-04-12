import { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/store';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  tags: string[];
  assignedTo?: string;
  lastContact?: string;
  createdAt: string;
}

export function Contacts() {
  const { hasPermission } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setContacts([
      { id: '1', name: 'Juan Pérez', email: 'juan@example.com', phone: '+5491112345678', company: 'TechCorp', status: 'qualified', tags: ['premium', 'tech'], lastContact: '2024-01-15', createdAt: '2024-01-01' },
      { id: '2', name: 'María García', email: 'maria@example.com', phone: '+5491187654321', company: 'StartupXYZ', status: 'new', tags: ['startup'], lastContact: '2024-01-14', createdAt: '2024-01-10' },
      { id: '3', name: 'Carlos López', email: 'carlos@example.com', phone: '+5491165432187', company: 'Retail SA', status: 'converted', tags: ['cliente', 'retail'], lastContact: '2024-01-13', createdAt: '2023-12-20' },
      { id: '4', name: 'Ana Martínez', email: 'ana@example.com', phone: '+5491123456789', company: 'Consultora', status: 'contacted', tags: ['consultoria'], lastContact: '2024-01-12', createdAt: '2024-01-05' },
      { id: '5', name: 'Roberto Sánchez', email: 'roberto@example.com', phone: '+5491198765432', status: 'lost', tags: [], lastContact: '2024-01-10', createdAt: '2023-11-15' },
    ]);
  }, []);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'qualified': return 'bg-purple-100 text-purple-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const canWrite = hasPermission('contacts:write');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-500">{filteredContacts.length} contactos</p>
        </div>
        {canWrite && (
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Nuevo Contacto
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Todos</option>
          <option value="new">Nuevo</option>
          <option value="contacted">Contactado</option>
          <option value="qualified">Calificado</option>
          <option value="converted">Convertido</option>
          <option value="lost">Perdido</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Teléfono</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Empresa</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Etiquetas</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{contact.name}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{contact.email}</td>
                <td className="px-4 py-3 text-gray-600">{contact.phone}</td>
                <td className="px-4 py-3 text-gray-600">{contact.company || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {contact.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron contactos
        </div>
      )}
    </div>
  );
}