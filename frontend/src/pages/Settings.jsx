import { useState } from 'react';
import { workspaceService, userService, emailConfigService } from '../services/api';
import { User, Building, Bell, Shield, Mail, MessageCircle } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building },
    { id: 'email', label: 'Email Integration', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="flex gap-6">
        <div className="w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'workspace' && <WorkspaceSettings />}
          {activeTab === 'email' && <EmailSettings />}
          {activeTab === 'whatsapp' && <WhatsAppSettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800">
            <option>UTC</option>
            <option>America/New_York</option>
            <option>America/Chicago</option>
            <option>America/Mexico_City</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function WorkspaceSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Workspace Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-800">FREE</div>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function EmailSettings() {
  const [formData, setFormData] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'TLS',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await emailConfigService.configure({
        ...formData,
        type: 'SMTP',
      });
      setMessage({ type: 'success', text: `Email configured successfully! Connected to ${response.data.host}` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to configure email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Email Integration (SMTP)</h2>
      <p className="text-sm text-gray-500 mb-4">
        Configure your SMTP server to send emails from the CRM.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
            <input
              type="text"
              placeholder="smtp.gmail.com"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input
              type="number"
              placeholder="587"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="your@email.com"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="App password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
          <select
            value={formData.encryption}
            onChange={(e) => setFormData({ ...formData, encryption: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800"
          >
            <option value="TLS">TLS (recomended)</option>
            <option value="SSL">SSL</option>
            <option value="NONE">None</option>
          </select>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Save & Test Connection'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">Important</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• For Gmail, use an <strong>App Password</strong> (not your regular password)</li>
          <li>• Generate App Password in your Google Account → Security → App passwords</li>
          <li>• For Outlook/Office 365, use your regular email password</li>
        </ul>
      </div>
    </div>
  );
}

function WhatsAppSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">WhatsApp Integration</h2>
      <p className="text-sm text-gray-500 mb-4">
        Configure your WhatsApp Business API to send and receive messages.
      </p>
      
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">WhatsApp integration coming soon</p>
        <p className="text-sm text-gray-400 mt-1">Configure via Meta Developer Portal first</p>
      </div>
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
          <span>Email notifications for new deals</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="w-5 h-5 text-blue-600" defaultChecked />
          <span>Email notifications for task assignments</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="w-5 h-5 text-blue-600" />
          <span>Daily summary emails</span>
        </label>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800" />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Update Password
        </button>
      </div>
    </div>
  );
}