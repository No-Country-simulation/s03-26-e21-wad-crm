import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, workspaceService, emailConfigService } from '../services/api';
import { User, Building, Bell, Shield, Mail, MessageCircle } from 'lucide-react';

const inp = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, refreshUser } = useAuth();

  const tabs = [
    { id: 'profile',       label: 'Profile',            icon: User },
    { id: 'workspace',     label: 'Workspace',          icon: Building },
    { id: 'email',         label: 'Email Integration',  icon: Mail },
    { id: 'whatsapp',      label: 'WhatsApp',           icon: MessageCircle, color: '#25D366' },
    { id: 'notifications', label: 'Notifications',       icon: Bell },
    { id: 'security',      label: 'Security',            icon: Shield },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-accent)' }}>Settings</h1>
      <div className="flex gap-6">
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left"
                style={activeTab === tab.id
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: tab.color || 'var(--color-muted)', background: 'transparent' }}>
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-1 rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {activeTab === 'profile'       && <ProfileSettings user={user} refreshUser={refreshUser} />}
          {activeTab === 'workspace'     && <WorkspaceSettings />}
          {activeTab === 'email'         && <EmailSettings />}
          {activeTab === 'whatsapp'      && <WhatsAppSettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'security'      && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>{children}</h2>;
}

function Label({ children }) {
  return <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>{children}</label>;
}

function SaveBtn({ children = 'Save Changes', disabled, onClick }) {
  return (
    <button disabled={disabled} onClick={onClick} className="px-6 py-2 rounded-lg font-medium disabled:opacity-50" style={{ background: 'var(--color-primary)', color: '#fff' }}>
      {children}
    </button>
  );
}

function ProfileSettings({ user, refreshUser }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await userService.updateProfile(formData);
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle>Profile Settings</SectionTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <input type="text" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
        </div>
        <div>
          <Label>Email</Label>
          <input type="email" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
        </div>
        <div>
          <Label>Phone</Label>
          <input type="tel" value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} />
        </div>
        <div>
          <Label>Timezone</Label>
          <select className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp}>
            <option>UTC</option>
            <option>America/New_York</option>
            <option>America/Mexico_City</option>
          </select>
        </div>
        {message && (
          <div className="p-3 rounded-lg" style={message.type === 'success'
            ? { background: '#16a34a22', border: '1px solid #16a34a', color: '#4ade80' }
            : { background: '#dc262622', border: '1px solid #dc2626', color: '#f87171' }}>
            {message.text}
          </div>
        )}
        <SaveBtn disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</SaveBtn>
      </form>
    </div>
  );
}

function WorkspaceSettings() {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    try {
      const r = await workspaceService.get();
      setFormData({ name: r.data.name || '', description: r.data.description || '' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await workspaceService.update(formData);
      setMessage({ type: 'success', text: 'Workspace updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update workspace' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: 'var(--color-muted)' }}>Loading...</div>;

  return (
    <div>
      <SectionTitle>Workspace Settings</SectionTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Workspace Name</Label>
          <input type="text" value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
        </div>
        <div>
          <Label>Description</Label>
          <textarea value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none resize-none" style={inp} rows={3} />
        </div>
        {message && (
          <div className="p-3 rounded-lg" style={message.type === 'success'
            ? { background: '#16a34a22', border: '1px solid #16a34a', color: '#4ade80' }
            : { background: '#dc262622', border: '1px solid #dc2626', color: '#f87171' }}>
            {message.text}
          </div>
        )}
        <SaveBtn disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</SaveBtn>
      </form>
    </div>
  );
}

function EmailSettings() {
  const [formData, setFormData] = useState({ host: '', port: 587, username: '', password: '', encryption: 'TLS' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await emailConfigService.configure({ ...formData, type: 'SMTP' });
      setMessage({ type: 'success', text: `Connected to ${response.data.host}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to configure email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle>Email Integration (SMTP)</SectionTitle>
      <p className="text-sm mb-4" style={{ color: 'var(--color-muted)' }}>Configure your SMTP server to send emails from the CRM.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>SMTP Host</Label>
            <input type="text" placeholder="smtp.gmail.com" value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
          </div>
          <div>
            <Label>Port</Label>
            <input type="number" value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Username</Label>
            <input type="text" placeholder="your@email.com" value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
          </div>
          <div>
            <Label>Password</Label>
            <input type="password" placeholder="App password" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
          </div>
        </div>
        <div>
          <Label>Encryption</Label>
          <select value={formData.encryption} onChange={(e) => setFormData({ ...formData, encryption: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp}>
            <option value="TLS">TLS (recommended)</option>
            <option value="SSL">SSL</option>
            <option value="NONE">None</option>
          </select>
        </div>
        {message && (
          <div className="p-3 rounded-lg" style={message.type === 'success'
            ? { background: '#16a34a22', border: '1px solid #16a34a', color: '#4ade80' }
            : { background: '#dc262622', border: '1px solid #dc2626', color: '#f87171' }}>
            {message.text}
          </div>
        )}
        <SaveBtn disabled={loading}>{loading ? 'Testing...' : 'Save & Test Connection'}</SaveBtn>
      </form>
      <div className="mt-6 p-4 rounded-lg" style={{ background: '#d9770611', border: '1px solid #d97706' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#fbbf24' }}>Important</h3>
        <ul className="text-sm space-y-1" style={{ color: '#fcd34d' }}>
          <li>• For Gmail, use an <strong>App Password</strong></li>
          <li>• Generate it in Google Account → Security → App passwords</li>
        </ul>
      </div>
    </div>
  );
}

function WhatsAppSettings() {
  return (
    <div>
      <SectionTitle>WhatsApp Integration</SectionTitle>
      <div className="p-8 rounded-lg text-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#25D366' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Coming Soon</h3>
        <p style={{ color: 'var(--color-muted)' }}>WhatsApp Business API integration is being developed.</p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-muted)' }}>Contact support for early access.</p>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  const [preferences, setPreferences] = useState({
    emailNewDeals: true,
    emailTaskAssignments: true,
    dailySummary: false,
  });
  const [message, setMessage] = useState(null);

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleSave = () => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    setMessage({ type: 'success', text: 'Preferences saved successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div>
      <SectionTitle>Notification Preferences</SectionTitle>
      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <span style={{ color: 'var(--color-text)' }}>Email notifications for new deals</span>
          <button type="button" onClick={() => handleToggle('emailNewDeals')}
            className="w-12 h-6 rounded-full transition-colors relative" style={{ background: preferences.emailNewDeals ? '#16a34a' : '#6b7280' }}>
            <span className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform" style={{ transform: preferences.emailNewDeals ? 'translateX(26px)' : 'translateX(2px)' }} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <span style={{ color: 'var(--color-text)' }}>Email notifications for task assignments</span>
          <button type="button" onClick={() => handleToggle('emailTaskAssignments')}
            className="w-12 h-6 rounded-full transition-colors relative" style={{ background: preferences.emailTaskAssignments ? '#16a34a' : '#6b7280' }}>
            <span className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform" style={{ transform: preferences.emailTaskAssignments ? 'translateX(26px)' : 'translateX(2px)' }} />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg" style={{ background: 'var(--color-surface-2)' }}>
          <span style={{ color: 'var(--color-text)' }}>Daily summary emails</span>
          <button type="button" onClick={() => handleToggle('dailySummary')}
            className="w-12 h-6 rounded-full transition-colors relative" style={{ background: preferences.dailySummary ? '#16a34a' : '#6b7280' }}>
            <span className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform" style={{ transform: preferences.dailySummary ? 'translateX(26px)' : 'translateX(2px)' }} />
          </button>
        </label>
        {message && (
          <div className="p-3 rounded-lg" style={message.type === 'success'
            ? { background: '#16a34a22', border: '1px solid #16a34a', color: '#4ade80' }
            : { background: '#dc262622', border: '1px solid #dc2626', color: '#f87171' }}>
            {message.text}
          </div>
        )}
        <SaveBtn onClick={handleSave}>Save Preferences</SaveBtn>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await userService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionTitle>Security Settings</SectionTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Current Password</Label>
          <input type="password" value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
        </div>
        <div>
          <Label>New Password</Label>
          <input type="password" value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <input type="password" value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={inp} required />
        </div>
        {message && (
          <div className="p-3 rounded-lg" style={message.type === 'success'
            ? { background: '#16a34a22', border: '1px solid #16a34a', color: '#4ade80' }
            : { background: '#dc262622', border: '1px solid #dc2626', color: '#f87171' }}>
            {message.text}
          </div>
        )}
        <SaveBtn disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</SaveBtn>
      </form>
    </div>
  );
}
