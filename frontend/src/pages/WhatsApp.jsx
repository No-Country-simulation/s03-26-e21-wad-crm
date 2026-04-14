import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, Activity, Send, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function ContactInfoPanel({ isOpen, onClose, contact }) {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Información del Contacto</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-400">Nombre</p>
            <p className="text-white">{contact.name || 'No disponible'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Email</p>
            <p className="text-white">{contact.email || 'No disponible'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Teléfono</p>
            <p className="text-white">{contact.phone || 'No disponible'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatsApp() {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [contacts, setContacts] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactPanel, setShowContactPanel] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lockStatus, setLockStatus] = useState(null);
  const messagesEndRef = useRef(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const crmConfig = { token, baseUrl };

  const loadCrmContacts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/api/contacts?page=0&size=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const map = {};
        (data.content || []).forEach((c) => { map[c.id] = c; });
        setContacts(map);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }, [token, baseUrl]);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${baseUrl}/api/conversations?page=0&size=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Sesión expirada. Cerrá sesión y volvé a iniciar.');
        }
        return;
      }
      const data = await res.json();
      setConversations(data.content || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token, baseUrl]);

  const fetchMessages = useCallback(async (convId) => {
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/api/conversations/${convId}/messages?page=0&size=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.content || []);
        setSelectedConv(convId);
        fetchAttendingStatus(convId);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [token, baseUrl]);

  const fetchAttendingStatus = useCallback(async (convId) => {
    if (!token || !convId) return;
    try {
      const res = await fetch(`${baseUrl}/api/whatsapp/conversations/${convId}/attending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLockStatus(data);
      }
    } catch (err) {
      console.error('Error fetching attending status:', err);
    }
  }, [token, baseUrl]);

  const startAttending = useCallback(async () => {
    if (!selectedConv || !token) return;
    try {
      const res = await fetch(`${baseUrl}/api/whatsapp/conversations/${selectedConv}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAttendingStatus(selectedConv);
      }
    } catch (err) {
      console.error('Error starting attending:', err);
    }
  }, [selectedConv, token, baseUrl, fetchAttendingStatus]);

  const stopAttending = useCallback(async () => {
    if (!selectedConv || !token) return;
    try {
      const res = await fetch(`${baseUrl}/api/whatsapp/conversations/${selectedConv}/stop`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLockStatus({ isAttending: false });
      }
    } catch (err) {
      console.error('Error stopping attending:', err);
    }
  }, [selectedConv, token, baseUrl]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConv || !token) return;
    try {
      const res = await fetch(`${baseUrl}/api/conversations/${selectedConv}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConv);
        fetchConversations();
      }
    } catch (err) {
      setError(err.message);
    }
  }, [newMessage, selectedConv, token, baseUrl, fetchMessages, fetchConversations]);

  useEffect(() => {
    if (token) {
      loadCrmContacts();
      fetchConversations();
    }
  }, [token, loadCrmContacts, fetchConversations]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedConv || !token) return;
    const interval = setInterval(() => {
      fetchConversations();
      fetchMessages(selectedConv);
      fetchAttendingStatus(selectedConv);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedConv, token, fetchConversations, fetchMessages, fetchAttendingStatus]);

  const getContactInfo = (contactId) => {
    const c = contacts[contactId];
    if (!c) return { name: 'Contacto', phone: '', email: '' };
    return c;
  };

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      if (isNaN(d.getTime())) return dateStr;
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) + ' ' +
             d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'SENT': return '✓';
      case 'DELIVERED': return '✓✓';
      case 'READ': return '✓✓';
      case 'FAILED': return '✗';
      default: return '◷';
    }
  };

  const selectedConvData = conversations.find(c => c.id === selectedConv);
  const selectedContactInfo = selectedConvData ? getContactInfo(selectedConvData.contactId) : null;

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
          <MessageCircle className="w-7 h-7 text-green-500" />
          WhatsApp
        </h1>
        <button
          onClick={() => fetchConversations()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ 
        background: 'var(--color-surface)', 
        borderColor: 'var(--color-border)',
        height: 'calc(100vh - 200px)',
        minHeight: '500px'
      }}>
        <div className="flex h-full">
          <div className="w-80 border-r flex flex-col" style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                Conversaciones
              </h2>
            </div>

            {error && (
              <div className="mx-3 mt-3 p-2 rounded text-xs" style={{ 
                background: '#dc2626/20', 
                color: '#fca5a5',
                border: '1px solid #dc2626'
              }}>
                ❌ {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <div className="flex items-center justify-center py-8 text-sm" style={{ color: 'var(--color-muted)' }}>
                  Sin conversaciones
                </div>
              )}

              {conversations.map((conv) => {
                const info = getContactInfo(conv.contactId);
                const isSelected = selectedConv === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => fetchMessages(conv.id)}
                    className="w-full text-left p-3 transition-colors"
                    style={{
                      background: isSelected ? '#22c55e20' : 'transparent',
                      borderBottom: '1px solid var(--color-border)',
                      borderLeft: isSelected ? '2px solid #22c55e' : '2px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: '#059669' }}
                      >
                        {info.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                            {info.name}
                          </span>
                          <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--color-muted)' }}>
                            {conv.lastMessageAt ? formatMsgTime(conv.lastMessageAt) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs truncate" style={{ color: 'var(--color-muted)' }}>
                            {info.phone || info.email || 'Sin datos'}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2" style={{ background: '#22c55e20', color: '#22c55e' }}>
                            WA
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-border)' }} />
                  <p className="text-lg" style={{ color: 'var(--color-muted)' }}>Seleccioná una conversación</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => {
                        setSelectedContact(selectedConvData?.contactId ? contacts[selectedConvData.contactId] : null);
                        setShowContactPanel(true);
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: '#059669' }}
                      >
                        {selectedContactInfo?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {selectedContactInfo?.name || 'Contacto'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                          {selectedContactInfo?.phone || selectedContactInfo?.email || ''}
                        </p>
                      </div>
                    </div>

                    {!lockStatus?.isAttending ? (
                      <button
                        onClick={startAttending}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white"
                        style={{ background: '#22c55e' }}
                      >
                        🟢 Iniciar
                      </button>
                    ) : lockStatus?.agentId === user?.id ? (
                      <button
                        onClick={stopAttending}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{ background: '#dc262640', color: '#fca5a5', border: '1px solid #dc262650' }}
                      >
                        🔴 Cerrar
                      </button>
                    ) : null}
                  </div>
                </div>

                {lockStatus?.isAttending && lockStatus?.agentId !== user?.id && (
                  <div className="p-4 flex items-center gap-2 text-sm" style={{ background: '#ca8a0420', color: '#fbbf24', borderBottom: '1px solid #ca8a04' }}>
                    <Activity className="w-5 h-5" />
                    <span className="font-medium">🔒 Atendiendo: {lockStatus.agentName}</span>
                    <span className="text-xs ml-auto">Solo lectura</span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        Sin mensajes en esta conversación
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className="max-w-md px-4 py-2.5 rounded-2xl text-sm"
                          style={{
                            background: msg.direction === 'OUTBOUND' ? '#059669' : 'var(--color-surface-2)',
                            color: msg.direction === 'OUTBOUND' ? '#fff' : 'var(--color-text)',
                            borderBottomLeftRadius: msg.direction === 'OUTBOUND' ? '8px' : '2px',
                            borderBottomRightRadius: msg.direction === 'OUTBOUND' ? '2px' : '8px',
                          }}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          <div className={`flex items-center justify-end gap-2 mt-1 text-xs ${
                            msg.direction === 'OUTBOUND' ? 'text-green-200' : 'text-gray-400'
                          }`}>
                            <span>{formatMsgTime(msg.sentAt)}</span>
                            {msg.status && msg.direction === 'OUTBOUND' && (
                              <span>{getMessageStatusIcon(msg.status)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {lockStatus?.isAttending && lockStatus?.agentId === user?.id ? (
                  <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Escribí un mensaje..."
                        rows={1}
                        className="flex-1 rounded-lg px-3 py-2 resize-none min-h-[40px] max-h-[120px]"
                        style={{
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text)',
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !selectedConv}
                        className="px-4 py-2 rounded-lg text-white disabled:opacity-40"
                        style={{ background: '#22c55e' }}
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : !lockStatus?.isAttending ? (
                  <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="p-3 rounded-lg text-sm text-center" style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}>
                      📖 Solo lectura - Hacé clic en <strong>"Iniciar"</strong> para atender
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="p-3 rounded-lg text-sm text-center" style={{ background: '#ca8a0420', color: '#fbbf24' }}>
                      🔒 Atendido por: <strong>{lockStatus?.agentName}</strong>
                      <br />
                      <span className="text-xs">Esperá a que cierre la atención</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ContactInfoPanel
        isOpen={showContactPanel}
        onClose={() => setShowContactPanel(false)}
        contact={selectedContact}
      />
    </div>
  );
}
