import React, { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';

// Simple WhatsApp configuration panel for Settings
// This panel reads current config from /api/settings/integrations/whatsapp
// and allows saving/updating the 4 fields defined in WhatsAppConfigRequest

export default function WhatsAppSettingsPanel() {
  const [config, setConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    webhookVerifyToken: '',
    appSecret: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Retrieve current config on mount
  useEffect(() => {
    fetch('/api/settings/integrations/whatsapp', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setConfig({
            phoneNumberId: data.phoneNumberId || '',
            accessToken: data.accessToken || '',
            webhookVerifyToken: data.webhookVerifyToken || '',
            appSecret: data.appSecret || '',
          });
        }
      })
      .catch(() => {
        // ignore errors here; show empty form
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((c) => ({ ...c, [name]: value }));
  };

  const save = () => {
    setLoading(true);
    fetch('/api/settings/integrations/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumberId: config.phoneNumberId,
        accessToken: config.accessToken,
        webhookVerifyToken: config.webhookVerifyToken,
        appSecret: config.appSecret,
      }),
    })
      .then(res => res.json())
      .then((d) => {
        setMessage(d?.message || 'WhatsApp configuration saved');
      })
      .catch(() => setMessage('Error saving configuration'))
      .finally(() => setLoading(false));
  };

  return (
    <section className="whatsapp-settings card" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #2b2b2b', background: 'var(--color-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>WhatsApp Configuration</h3>
        <button onClick={save} disabled={loading} className="save-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 6, background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
          <Save size={16} /> Save
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        <div>
          <label>Phone Number ID</label>
          <input name="phoneNumberId" value={config.phoneNumberId} onChange={handleChange}
                 placeholder="Phone Number ID" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #444' }} />
        </div>
        <div>
          <label>Access Token</label>
          <input name="accessToken" value={config.accessToken} onChange={handleChange}
                 placeholder="Access Token" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #444' }} />
        </div>
        <div>
          <label>Webhook Verify Token</label>
          <input name="webhookVerifyToken" value={config.webhookVerifyToken} onChange={handleChange}
                 placeholder="Webhook Verify Token" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #444' }} />
        </div>
        <div>
          <label>App Secret</label>
          <input name="appSecret" value={config.appSecret} onChange={handleChange}
                 placeholder="App Secret" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #444' }} />
        </div>
      </div>
      {message && <div style={{ marginTop: 8, color: '#ccc' }}>{message}</div>}
    </section>
  );
}
