import React, { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle, XCircle, Copy, Send, MessageCircle, Users, Settings, RefreshCw } from 'lucide-react';

export default function WhatsAppSettingsPanel() {
  const [config, setConfig] = useState({
    phoneNumberId: '',
    accessToken: '',
    webhookVerifyToken: '',
    appSecret: '',
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const callbackUrl = 'https://nexo-crm-api.onrender.com/api/whatsapp/webhook';
  const testPhone = '+1234567890'; // Test phone for verification

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    fetch('/api/settings/integrations', {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        if (data.whatsapp && data.whatsapp.connected) {
          setIsConnected(true);
          setConfig(prev => ({ ...prev, phoneNumberId: data.whatsapp.phoneNumberId || '' }));
        }
      })
      .catch(() => {});
  };

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
      body: JSON.stringify(config),
    })
      .then(res => res.json())
      .then((d) => {
        if (d.error) {
          setMessage(d.message || d.error);
          setStatus('error');
        } else {
          setMessage('✅ Configuración guardada correctamente');
          setStatus('success');
          setIsConnected(true);
        }
      })
      .catch(() => {
        setMessage('🔴 Error al guardar configuración');
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
      if (data.success) {
        setMessage('✅ Conexión exitosa con Meta');
        setStatus('success');
        setIsConnected(true);
      } else {
        setMessage(`🔴 ${data.error || 'Token inválido o ID incorrecto'}`);
        setStatus('error');
      }
    } catch (err) {
      setMessage('🔴 Error de conexión con el servidor');
      setStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const sendTestMessage = async () => {
    if (!isConnected) return;
    setSending(true);
    setMessage('');
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add auth header in real implementation
        },
        body: JSON.stringify({
          contactId: null,
          phoneNumber: testPhone,
          body: '🎉 ¡Hola! Esto es un mensaje de prueba desde Nexo CRM.',
        }),
      });
      const data = await res.json();
      if (data.messageId) {
        setMessage('✅ Mensaje de prueba enviado correctamente');
        setStatus('success');
      } else {
        setMessage(`🔴 ${data.error || 'Error al enviar mensaje'}`);
        setStatus('error');
      }
    } catch (err) {
      setMessage('🔴 Error al enviar mensaje');
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(callbackUrl);
    setMessage('📋 URL copiada al portapapeles');
    setStatus('success');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Connection Status Card */}
      <div style={{ 
        padding: 16, 
        borderRadius: 12, 
        border: '1px solid var(--color-border)', 
        background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            background: isConnected ? '#22c55e' : '#ef4444' 
          }} />
          <div>
            <h4 style={{ margin: 0, color: 'var(--color-text)' }}>
              {isConnected ? '✅ WhatsApp Conectado' : '⚪ WhatsApp Desconectado'}
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>
              {isConnected 
                ? `Número: ${config.phoneNumberId}` 
                : 'Configure sus credenciales para comenzar'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--color-muted)', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <Settings size={16} />
          {showAdvanced ? 'Ocultar opciones' : 'Mostrar opciones'}
        </button>
      </div>

      {showAdvanced && (
        <>
          {/* Webhook URL */}
          <div style={{ padding: 16, borderRadius: 12, border: '1px solid #25D366', background: 'rgba(37, 211, 102, 0.1)' }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#25D366', fontWeight: 600 }}>
              🔗 Webhook Callback URL
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                readOnly 
                value={callbackUrl} 
                style={{ 
                  flex: 1, 
                  padding: '10px 12px', 
                  borderRadius: 6, 
                  border: '1px solid #25D366', 
                  background: 'var(--color-surface)', 
                  color: 'var(--color-text)',
                  fontFamily: 'monospace',
                  fontSize: 13
                }}
              />
              <button 
                onClick={copyToClipboard}
                style={{ 
                  padding: 10, 
                  borderRadius: 6, 
                  border: 'none', 
                  background: '#25D366', 
                  color: '#fff', 
                  cursor: 'pointer' 
                }}
              >
                <Copy size={16} />
              </button>
            </div>
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--color-muted)' }}>
              Copie esta URL en Meta Developers → WhatsApp → Configuration → Webhook URL
            </p>
          </div>

          {/* Configuration Fields */}
          <div style={{ padding: 20, borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: 'var(--color-text)' }}>⚙️ Configuración</h3>
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
                    opacity: testing || !config.phoneNumberId || !config.accessToken ? 0.6 : 1
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
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading && <Loader2 className="animate-spin" size={14} />}
                  <Save size={16} /> Guardar
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>
                  📱 Phone Number ID
                </label>
                <input 
                  name="phoneNumberId" 
                  value={config.phoneNumberId} 
                  onChange={handleChange} 
                  placeholder="ID de su número de WhatsApp"
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>
                  🔑 Access Token
                </label>
                <input 
                  name="accessToken" 
                  value={config.accessToken} 
                  onChange={handleChange} 
                  placeholder="EAACk... (Token de Meta)"
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>
                  🔐 Webhook Verify Token
                </label>
                <input 
                  name="webhookVerifyToken" 
                  value={config.webhookVerifyToken} 
                  onChange={handleChange} 
                  placeholder="Token para verificar webhooks"
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: 'var(--color-text)', fontWeight: 500 }}>
                  🔒 App Secret
                </label>
                <input 
                  name="appSecret" 
                  value={config.appSecret} 
                  onChange={handleChange} 
                  placeholder="App Secret de Meta"
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} 
                />
              </div>
            </div>
          </div>

          {/* Test Message Section */}
          {isConnected && (
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface-2)' }}>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text)' }}>🧪 Enviar Mensaje de Prueba</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--color-muted)' }}>
                Envíe un mensaje de prueba para verificar que la conexión funciona correctamente.
              </p>
              <button 
                onClick={sendTestMessage}
                disabled={sending}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: 6, 
                  background: '#25D366', 
                  color: '#fff', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center', 
                  gap: 8,
                  opacity: sending ? 0.6 : 1
                }}
              >
                {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Enviar Mensaje de Prueba
              </button>
            </div>
          )}
        </>
      )}

      {/* Status Message */}
      {message && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: 8, 
          background: status === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
          border: `1px solid ${status === 'success' ? '#22c55e' : '#ef4444'}`,
          color: status === 'success' ? '#22c55e' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {status === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {message}
        </div>
      )}

      {/* Quick Actions When Connected */}
      {isConnected && !showAdvanced && (
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button 
            onClick={() => setShowAdvanced(true)}
            style={{ 
              padding: '10px 16px', 
              borderRadius: 6, 
              background: 'var(--color-surface-2)', 
              color: 'var(--color-text)', 
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center', 
              gap: 8,
              flex: 1
            }}
          >
            <Settings size={16} /> Configurar
          </button>
          <button 
            onClick={sendTestMessage}
            disabled={sending}
            style={{ 
              padding: '10px 16px', 
              borderRadius: 6, 
              background: '#25D366', 
              color: '#fff', 
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center', 
              gap: 8,
              flex: 1,
              opacity: sending ? 0.6 : 1
            }}
          >
            {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Enviar Prueba
          </button>
        </div>
      )}
    </div>
  );
}