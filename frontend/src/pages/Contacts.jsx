import { useState, useEffect } from 'react';
import { contactsService } from '../services/api';
import { Plus, Search, Mail, Phone, Trash2, User, Building } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await contactsService.getAll();
      const data = response.data.content || response.data;
      setAllContacts(data);
      setContacts(data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) {
      setContacts(allContacts);
    } else {
      const filtered = allContacts.filter(c => {
        const nameMatch = c.name?.toLowerCase().includes(value.toLowerCase());
        const emailMatch = c.email?.toLowerCase().includes(value.toLowerCase());
        const phoneMatch = c.phone?.includes(value);
        return nameMatch || emailMatch || phoneMatch;
      });
      setContacts(filtered);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactsService.create(formData);
      setFormData({ name: '', email: '', phone: '' });
      setShowForm(false);
      loadContacts();
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert('Failed to create contact');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await contactsService.delete(id);
        loadContacts();
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">New Contact</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Full Name (e.g., John Doe)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-800"
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Email (e.g., john@example.com)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-800"
                  required
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  placeholder="Phone (e.g., +1 234 567 8900)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 text-gray-800"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md font-medium"
            >
              Save Contact
            </button>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search contacts by name, email or phone..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors shadow-sm placeholder-gray-400 text-gray-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No contacts yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first contact</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow flex flex-col justify-between min-h-[180px]"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-lg text-gray-800 truncate">{contact.name}</h3>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                      contact.status === 'NEW' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      contact.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      contact.status === 'QUALIFIED' ? 'bg-green-100 text-green-700 border border-green-200' :
                      contact.status === 'LOST' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm truncate">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                )}
                {contact.jobTitle && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building size={16} className="text-gray-400" />
                    <span className="text-sm">{contact.jobTitle}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Created: {new Date(contact.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-center text-gray-500 text-sm">
        Total: {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
