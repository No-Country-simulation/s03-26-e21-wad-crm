import { useState } from 'react';
import { emailConfigService } from '../services/api';
import { User, Building, Bell, Shield, Mail, MessageCircle } from 'lucide-react';

const inp = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' };

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
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
          {activeTab === 'profile'       && <ProfileSettings />}
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

function ProfileSettings() {
  return (
    <div>
      <SectionTitle>Profile Settings</SectionTitle>
      <div className="space-y-4">
        {['Name', 'Email', 'Phone'].map((f) => (
          <div key={f}>
            <Label>{f}</Label>
            <input type={f === 'Email' ? 'email' : f === 'Phone' ? 'tel' : 'text'} className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ ...{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' } }} />
          </div>
        ))}
        <div>
          <Label>Timezone</Label>
          <select className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <option>UTC</option>
            <option>America/New_York</option>
            <option>America/Mexico_City</option>
          </select>
        </div>
        <SaveBtn />
      </div>
    </div>
  );
}

function WorkspaceSettings() {
  return (
    <div>
      <SectionTitle>Workspace Settings</SectionTitle>
      <div className="space-y-4">
        <div>
          <Label>Workspace Name</Label>
          <input type="text" className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
        </div>
        <div>
          <Label>Plan</Label>
          <div className="px-4 py-2 rounded-lg" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>FREE</div>
        </div>
        <SaveBtn />
      </div>
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
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} required />
          </div>
          <div>
            <Label>Port</Label>
            <input type="number" value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Username</Label>
            <input type="text" placeholder="your@email.com" value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} required />
          </div>
          <div>
            <Label>Password</Label>
            <input type="password" placeholder="App password" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} required />
          </div>
        </div>
        <div>
          <Label>Encryption</Label>
          <select value={formData.encryption} onChange={(e) => setFormData({ ...formData, encryption: e.target.value })}
            className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
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
      <div className="p-4 rounded-lg text-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        <MessageCircle className="w-12 h-12 mx-auto mb-2" style={{ color: '#25D366' }} />
        <p style={{ color: 'var(--color-muted)' }}>WhatsApp integration coming soon</p>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div>
      <SectionTitle>Notification Preferences</SectionTitle>
      <div className="space-y-4">
        {['Email notifications for new deals', 'Email notifications for task assignments', 'Daily summary emails'].map((label, i) => (
          <label key={label} className="flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
            <input type="checkbox" className="w-5 h-5" defaultChecked={i < 2} />
            {label}
          </label>
        ))}
        <SaveBtn>Save Preferences</SaveBtn>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <SectionTitle>Security Settings</SectionTitle>
      <div className="space-y-4">
        {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
          <div key={label}>
            <Label>{label}</Label>
            <input type="password" className="w-full px-4 py-2 rounded-lg focus:outline-none" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
          </div>
        ))}
        <SaveBtn>Update Password</SaveBtn>
      </div>
    </div>
  );
}
