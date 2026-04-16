import React, { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle, XCircle, Copy } from 'lucide-react';

export default function WhatsAppSettingsPanel() {
  const [config, setConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    webhookVerifyToken: '',
    appSecret: '',
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const callbackUrl = 'https://nexo-crm-api.onrender.com/api/whatsapp/webhook';

  useEffect(() => {
    fetch('/api/settings/integrations/whatsapp', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setConfig({
            phoneNumberId: data.phoneNumberId || '',
            accessToken: data.accessToken || '',
            webhookVerifyToken: data.webhookVerifyToken || '',
            appSecret: data.appSecret || '',
          });
          setMessage('Configuración cargada');
          setStatus('success');
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((c) => ({ ...c, [name]: value }));
    setStatus(null);
    setMessage('');
  };

  const save = () => {
    setLoading(true);
    setMessage('');
    setStatus(null);
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
        if (d.message || d.error) {
          setMessage(d.message || d.error);
          setStatus(d.error ? 'error' : 'success');
        } else {
          setMessage('Configuración guardada');
          setStatus('success');
        }
      })
      .catch(() => {
        setMessage('Error al guardar');
        setStatus('error');
      })
      .finally(() => setLoading(false));
  };

  const testConnection = async () => {
    setTesting(true);
    setMessage('');
    setStatus(null);

    try {
      const res = await fetch('/api/settings/integrations/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: config.phoneNumberId,
          accessToken: config.accessToken,
        }),
      });
      const data = await res.json();
      
      if (data.success || res.ok) {
        setMessage('✅ Conexión exitosa con Meta');
        setStatus('success');
      } else {
        setMessage(`🔴 ${data.error || 'Token inválido o ID incorrecto'}`);
        setStatus('error');
      }
    } catch (err) {
      setMessage('🔴 Error de conexión');
      setStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(callbackUrl);
    setMessage('URL copiada al portapapeles');
    setStatus('success');
    setTimeout(() => setMessage(''), 3000);
  };

  const getStatusIcon = () => {
    if (testing || loading) return <Loader2 className="animate-spin" size={16} />;
    if (status === 'success') return <CheckCircle size={16} />;
    if (status === 'error') return <XCircle size={16} />;
    return null;
  };

  const getStatusColor = () => {
    if (status === 'success') return '#16a34a';
    if (status === 'error') return '#dc2626';
    return 'var(--color-muted)';
  };

  return (
    <section style={{ padding: 20, borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
      {/* Callback URL */}
      <div style={{ marginBottom: 20, padding: 12, borderRadius: 8, background: 'rgba(37, 211, 102, 0.1)', border: '1px solid #25D366' }}>
        <label style={{ display: 'block', marginBottom: 8, color: '#25D366', fontWeight: 600 }}>🔗 Webhook Callback URL</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            readOnly 
            value={callbackUrl} 
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #25D366', background: 'var(--color-surface)', color: 'var(--color-text)', fontFamily: 'monospace', fontSize: 13 }}
          />
          <button 
            onClick={copyToClipboard}
            style={{ padding: 8, borderRadius: 6, border: 'none', background: '#25D366', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Copiar URL"
          >
            <Copy size={16} />
          </button>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--color-muted)' }}>
          Copia esta URL y pégala en Meta Developers → WhatsApp → Configuration → Webhook URL
        </p>
      </div>

      {/* Configuration Fields */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, color: 'var(--color-text)' }}>⚙️ WhatsApp Configuration</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={testConnection} 
            disabled={testing || !config.phoneNumberId || !config.accessToken}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 6, 
              border: '2px solid #9333ea', 
              background: 'transparent', 
              color: '#9333ea', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center', 
              gap: 6,
              opacity: testing ? 0.7 : 1
            }}
          >
            {testing && <Loader2 className="animate-spin" size={14} />}
            Probar Conexión
          </button>
          <button 
            onClick={save} 
            disabled={loading}
            style={{ 
              padding: '8px 20px', 
              borderRadius: 6, 
              background: 'var(--color-primary)', 
              color: '#fff', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center', 
              gap: 6,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading && <Loader2 className="animate-spin" size={14} />}
            <Save size={16} /> Guardar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>📱 Phone Number ID</label>
          <input 
            name="phoneNumberId" 
            value={config.phoneNumberId} 
            onChange={handleChange} 
            placeholder="Ej: 1234567890" 
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>🔑 Access Token</label>
          <input 
            name="accessToken" 
            value={config.accessToken} 
            onChange={handleChange} 
            placeholder="EAACk..." 
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>🔐 Webhook Verify Token</label>
          <input 
            name="webhookVerifyToken" 
            value={config.webhookVerifyToken} 
            onChange={handleChange} 
            placeholder="Tu token de verificación" 
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>🔒 App Secret</label>
          <input 
            name="appSecret" 
            value={config.appSecret} 
            onChange={handleChange} 
            placeholder="Tu App Secret de Meta" 
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
          />
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div style={{ 
          marginTop: 16, 
          padding: '12px 16px', 
          borderRadius: 8, 
          background: status === 'success' ? 'rgba(22, 163, 74, 0.15)' : status === 'error' ? 'rgba(220, 38, 38, 0.15)' : 'var(--color-surface)',
          border: `1px solid ${getStatusColor()}`,
          color: getStatusColor(),
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {getStatusIcon()}
          {message}
        </div>
      )}
    </section>
  );
}