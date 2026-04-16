import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';

export default function WhatsAppSettingsPanel() {
  const [config, setConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    webhookVerifyToken: '',
    appSecret: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/settings/integrations/whatsapp', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
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
      .catch(() => {});
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
      .then((d) => setMessage(d?.message || 'WhatsApp configuration saved'))
      .catch(() => setMessage('Error saving configuration'))
      .finally(() => setLoading(false));
  };

  return (
    <section style={{ padding: '16px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: 'var(--color-text)' }}> WhatsApp Configuration</h3>
        <button onClick={save} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, background: 'var(--color-primary)', color: '#fff', border: 'none' }}>
          <Save size={16} /> Save
        </button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, color: 'var(--color-text)' }}>Phone Number ID</label>
          <input name="phoneNumberId" value={config.phoneNumberId} onChange={handleChange} placeholder="Phone Number ID from Meta" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, color: 'var(--color-text)' }}>Access Token</label>
          <input name="accessToken" value={config.accessToken} onChange={handleChange} placeholder="Meta Access Token" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, color: 'var(--color-text)' }}>Webhook Verify Token</label>
          <input name="webhookVerifyToken" value={config.webhookVerifyToken} onChange={handleChange} placeholder="Webhook Verify Token" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, color: 'var(--color-text)' }}>App Secret</label>
          <input name="appSecret" value={config.appSecret} onChange={handleChange} placeholder="Meta App Secret" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
        </div>
      </div>
      {message && <div style={{ marginTop: 12, color: 'var(--color-accent)' }}>{message}</div>}
    </section>
  );
}