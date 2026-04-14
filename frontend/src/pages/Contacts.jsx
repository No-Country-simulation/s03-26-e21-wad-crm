import { useState, useEffect } from 'react';
import { contactsService } from '../services/api';
import { Plus, Search, Mail, Phone, Trash2, User, Building, Pencil, X, MessageCircle } from 'lucide-react';

const inp = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { loadContacts(); }, []);

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
    if (!value.trim()) { setContacts(allContacts); return; }
    setContacts(allContacts.filter(c =>
      c.name?.toLowerCase().includes(value.toLowerCase()) ||
      c.email?.toLowerCase().includes(value.toLowerCase()) ||
      c.phone?.includes(value)
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactsService.create(formData);
      setFormData({ name: '', email: '', phone: '', status: null });
      setShowForm(false);
      loadContacts();
    } catch (error) {
      alert('Failed to create contact');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this contact?')) {
      try { await contactsService.delete(id); loadContacts(); } catch (e) { console.error(e); }
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setFormData({ name: contact.name, email: contact.email, phone: contact.phone || '', status: contact.status });
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await contactsService.update(editingId, formData);
      setFormData({ name: '', email: '', phone: '', status: null });
      setEditingId(null);
      setShowForm(false);
      loadContacts();
    } catch (error) {
      alert('Failed to update contact');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', status: null });
    setShowForm(false);
  };

  const handleSendEmail = (email) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleSendWhatsApp = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const statusColor = (s) => ({
    NEW: '#2563eb', CONTACTED: '#d97706', QUALIFIED: '#16a34a', LOST: '#dc2626', CONVERTED: '#7c3aed'
  }[s] || '#6b7280');

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Contacts</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
          <Plus size={20} /> Add Contact
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-6 mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{editingId ? 'Edit Contact' : 'New Contact'}</h2>
            <button type="button" onClick={handleCancelEdit} className="p-1 rounded" style={{ color: 'var(--color-muted)' }}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: User,  type: 'text',  key: 'name',  ph: 'Full Name' },
                { icon: Mail,  type: 'email', key: 'email', ph: 'Email' },
                { icon: Phone, type: 'tel',   key: 'phone', ph: 'Phone' },
              ].map(({ icon: Icon, type, key, ph }) => (
                <div key={key} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-muted)' }} />
                  <input type={type} placeholder={ph} value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none" style={inp}
                    required={key !== 'phone'} />
                </div>
              ))}
              {editingId && (
                <div className="relative">
                  <select
                    value={formData.status || 'NEW'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none appearance-none cursor-pointer" 
                    style={{ ...inp, backgroundColor: 'var(--color-surface-2)' }}>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-muted)' }}>
                    ▾
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="px-8 py-3 rounded-lg font-medium" style={{ background: 'var(--color-primary)', color: '#fff' }}>
              Save Contact
            </button>
          </form>
        </div>
      )}

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-muted)' }} />
        <input type="text" placeholder="Search contacts..." value={search} onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none" style={inp} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p className="mt-2" style={{ color: 'var(--color-muted)' }}>Loading contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <User className="mx-auto h-16 w-16 mb-4" style={{ color: 'var(--color-border)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>No contacts yet</h3>
          <p className="mb-4" style={{ color: 'var(--color-muted)' }}>Start by adding your first contact</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-2 rounded-lg" style={{ background: 'var(--color-primary)', color: '#fff' }}>
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-xl p-5 flex flex-col justify-between min-h-[180px]" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-lg truncate" style={{ color: 'var(--color-text)' }}>{contact.name}</h3>
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full font-medium" style={{ background: statusColor(contact.status) + '33', color: statusColor(contact.status) }}>
                      {contact.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleEdit(contact)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(contact.id)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--color-muted)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={16} style={{ color: 'var(--color-muted)' }} />
                  <span className="text-sm truncate" style={{ color: 'var(--color-muted)' }}>{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} style={{ color: 'var(--color-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{contact.phone}</span>
                  </div>
                )}
                {contact.jobTitle && (
                  <div className="flex items-center gap-2">
                    <Building size={16} style={{ color: 'var(--color-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-muted)' }}>{contact.jobTitle}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Created: {new Date(contact.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleSendEmail(contact.email)} className="p-2 rounded-lg transition-colors hover:bg-blue-100" style={{ color: '#EA4335' }} title="Send Email">
                    <Mail size={18} />
                  </button>
                  {contact.phone && (
                    <button onClick={() => handleSendWhatsApp(contact.phone)} className="p-2 rounded-lg transition-colors hover:bg-green-100" style={{ color: '#16a34a' }} title="Send WhatsApp">
                      <MessageCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
        Total: {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
