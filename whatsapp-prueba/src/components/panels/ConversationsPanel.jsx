import { ContactInfoPanel } from './ContactInfoPanel'

export default function ConversationsPanel({ crmConfig }) {
  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState({})
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [lockStatus, setLockStatus] = useState(null) // { isAttending, agentId, agentName }
  const [showContactPanel, setShowContactPanel] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const messagesEndRef = useState(null)

  const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8080' : (crmConfig?.baseUrl || '')

  // Load contacts to map contactId → name/phone
  useEffect(() => {
    if (!crmConfig?.token) return
    loadContacts()
  }, [crmConfig])

  async function loadContacts() {
    setLoadingContacts(true)
    try {
      const res = await axios.get(`${apiBase}/api/contacts?page=0&size=200`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      const map = {}
        ; (res.data.content || []).forEach(c => { map[c.id] = c })
      setContacts(map)
    } catch (err) {
      console.error('Error loading contacts:', err)
    } finally {
      setLoadingContacts(false)
    }
  }

  async function fetchConversations() {
    if (!crmConfig?.token) {
      setError('Sesión expirada. Cerrá sesión y volvé a iniciar.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${apiBase}/api/conversations?page=0&size=50`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setConversations(res.data.content || [])
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Sesión expirada. Cerrá sesión y volvé a iniciar.')
      } else {
        setError(err.response?.data?.message || err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages(convId) {
    if (!crmConfig?.token) return
    try {
      const res = await axios.get(`${apiBase}/api/conversations/${convId}/messages?page=0&size=200`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setMessages(res.data.content || [])
      setSelectedConv(convId)
      // Fetch attending status
      fetchAttendingStatus(convId)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  async function fetchAttendingStatus(convId) {
    if (!crmConfig?.token || !convId) return
    try {
      const res = await axios.get(`${apiBase}/api/whatsapp/conversations/${convId}/attending`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setLockStatus(res.data)
    } catch (err) {
      console.error('Error fetching attending status:', err)
    }
  }

  async function startAttending() {
    if (!selectedConv || !crmConfig?.token) return
    try {
      const res = await axios.post(`${apiBase}/api/whatsapp/conversations/${selectedConv}/start`, {}, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      if (res.data.started) {
        addLog('success', '🟢 Iniciaste atención', LOG_TYPES.LOCK)
        fetchAttendingStatus(selectedConv)
      } else {
        addLog('warn', `🔒 Ya está siendo atendida por ${res.data.attendingAgentName}`, LOG_TYPES.LOCK)
      }
    } catch (err) {
      addLog('error', `❌ Error al iniciar: ${err.response?.data?.message || err.message}`, LOG_TYPES.ERROR)
    }
  }

  async function stopAttending() {
    if (!selectedConv || !crmConfig?.token) return
    try {
      await axios.post(`${apiBase}/api/whatsapp/conversations/${selectedConv}/stop`, {}, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      addLog('success', '🔴 Cerraste atención', LOG_TYPES.LOCK)
      setLockStatus({ isAttending: false, agentId: null, agentName: null })
    } catch (err) {
      addLog('error', `❌ Error al cerrar: ${err.response?.data?.message || err.message}`, LOG_TYPES.ERROR)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConv || !crmConfig?.token) return
    setSending(true)
    try {
      await axios.post(`${apiBase}/api/conversations/${selectedConv}/messages`, {
        body: newMessage,
      }, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setNewMessage('')
      // Refresh messages
      const res = await axios.get(`${apiBase}/api/conversations/${selectedConv}/messages?page=0&size=200`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setMessages(res.data.content || [])
      // Also refresh conversations to update last message
      fetchConversations()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setSending(false)
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    if (crmConfig?.token) fetchConversations()
  }, [crmConfig])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Short polling: check for new messages every 10 segundos
  useEffect(() => {
    if (!crmConfig?.token || !selectedConv) return

    const interval = setInterval(() => {
      fetchConversations()
      fetchMessages(selectedConv)
      fetchAttendingStatus(selectedConv)
    }, 10000)

    return () => clearInterval(interval)
  }, [crmConfig?.token, selectedConv])

  function getContactInfo(contactId) {
    const c = contacts[contactId]
    if (!c) return { name: 'Contacto', phone: '', email: '' }
    return { name: c.name, phone: c.phone, email: c.email }
  }

  function formatMsgTime(dateStr) {
    if (!dateStr) return ''
    // El backend ya envía la hora en timezone configurada (America/Guayaquil)
    // Parseamos el string como fecha local sin conversión automática de timezone
    const d = new Date(dateStr.replace(' ', 'T'))
    if (isNaN(d.getTime())) return dateStr
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    if (isToday) return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  }

  const selectedConvData = conversations.find(c => c.id === selectedConv)
  const selectedContactInfo = selectedConvData ? getContactInfo(selectedConvData.contactId) : null

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      <div className="flex h-full">
        {/* ── Left Sidebar: Conversations List ── */}
        <div className="w-80 border-r border-slate-700 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              Conversaciones
            </h2>
            <button
              onClick={fetchConversations}
              disabled={loading}
              className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '...' : '↻'}
            </button>
          </div>

          {error && (
            <div className="mx-3 mt-3 p-2 rounded bg-red-900/30 text-red-300 text-xs border border-red-700">
              ❌ {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loadingContacts && conversations.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <span className="text-slate-500 text-sm">Cargando...</span>
              </div>
            )}
            {conversations.length === 0 && !loading && !loadingContacts && (
              <div className="flex items-center justify-center py-8">
                <span className="text-slate-500 text-sm">Sin conversaciones</span>
              </div>
            )}
            {conversations.map(conv => {
              const info = getContactInfo(conv.contactId)
              const isSelected = selectedConv === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => fetchMessages(conv.id)}
                  className={`w-full text-left p-3 border-b border-slate-800 transition-colors ${isSelected ? 'bg-green-900/20 border-l-2 border-l-green-500' : 'hover:bg-slate-800/50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${conv.channel === 'WHATSAPP' ? 'bg-green-700 text-white' : 'bg-blue-700 text-white'
                      }`}>
                      {info.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">{info.name}</span>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{conv.lastMessageAt ? formatMsgTime(conv.lastMessageAt) : ''}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-slate-400 truncate">
                          {info.phone || info.email || 'Sin datos'}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${conv.channel === 'WHATSAPP' ? 'bg-green-900/40 text-green-400' : 'bg-blue-900/40 text-blue-400'
                          }`}>
                          {conv.channel === 'WHATSAPP' ? 'WA' : 'EM'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right Panel: Messages ── */}
        <div className="flex-1 flex flex-col bg-slate-900/30">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Seleccioná una conversación</p>
                <p className="text-slate-600 text-sm mt-1">Elegí un contacto de la lista izquierda</p>
              </div>
            </div>
           ) : (
            <>
               {/* Header */}
               <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                 <div className="flex items-center gap-3 justify-between">
                    <div 
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                      onClick={() => {
                        setSelectedContact(selectedConvData?.contactId ? contacts[selectedConvData.contactId] : null)
                        setShowContactPanel(true)
                      }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${selectedConvData?.channel === 'WHATSAPP' ? 'bg-green-700 text-white' : 'bg-blue-700 text-white'
                        }`}>
                        {selectedContactInfo?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{selectedContactInfo?.name || 'Contacto'}</p>
                        <p className="text-xs text-slate-400">{selectedContactInfo?.phone || selectedContactInfo?.email || ''}</p>
                      </div>
                    </div>
                   {/* Botón Iniciar/Cerrar - solo visible si NO está siendo atendida por OTRO */}
                   {!lockStatus?.isAttending ? (
                     <button
                       onClick={startAttending}
                       className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
                     >
                       🟢 Iniciar
                     </button>
                   ) : lockStatus?.agentId === crmConfig?.userId ? (
                     <button
                       onClick={stopAttending}
                       className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600/40 text-red-300 border border-red-600/50 hover:bg-red-600/50 transition-colors"
                     >
                       🔴 Cerrar
                     </button>
                   ) : null}
                 </div>
               </div>

               {/* Banner - solo mostrar si está siendo atendida por OTRO agente */}
               {lockStatus?.isAttending && lockStatus?.agentId !== crmConfig?.userId && (
                 <div className="bg-yellow-900/40 border-b border-yellow-700 p-4 flex items-center gap-2 text-yellow-300 text-sm">
                   <Activity className="w-5 h-5 text-yellow-400" />
                   <span className="font-medium">🔒 Atendiendo: {lockStatus.agentName}</span>
                   <span className="text-xs text-yellow-400 ml-auto">Solo lectura</span>
                 </div>
               )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 text-sm">Sin mensajes en esta conversación</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md px-4 py-2.5 rounded-2xl text-sm ${msg.direction === 'OUTBOUND'
                        ? 'bg-green-700 text-white rounded-br-md'
                        : 'bg-slate-700 text-white rounded-bl-md'
                        }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        <div className={`flex items-center justify-end gap-2 mt-1 ${msg.direction === 'OUTBOUND' ? 'text-green-200' : 'text-slate-400'
                          }`}>
                          <span className="text-xs">{formatMsgTime(msg.sentAt)}</span>
                          {msg.status && msg.direction === 'OUTBOUND' && (
                            <span className="text-xs">
                              {msg.status === 'SENT' ? '✓' : msg.status === 'DELIVERED' ? '✓✓' : msg.status === 'READ' ? '✓✓' : msg.status === 'FAILED' ? '✗' : '◷'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Solo mostrar si YO estoy atendiendo */}
              {lockStatus?.isAttending && lockStatus?.agentId === crmConfig?.userId ? (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Escribí un mensaje..."
                      rows={1}
                      className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none min-h-[40px] max-h-[120px]"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim() || !selectedConv}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {sending ? '◷' : '→'}
                    </button>
                  </div>
                </div>
              ) : !lockStatus?.isAttending ? (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <div className="p-3 rounded-lg bg-slate-700/50 text-slate-400 text-sm text-center border border-slate-600">
                    📖 Solo lectura - Hacé clic en <strong>"Iniciar"</strong> para atender esta conversación
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <div className="p-3 rounded-lg bg-yellow-900/20 text-yellow-300 text-sm text-center border border-yellow-700">
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

      {/* ContactInfoPanel - Opens on contact name click */}
      <ContactInfoPanel
        isOpen={showContactPanel}
        onClose={() => setShowContactPanel(false)}
        contact={selectedContact}
      />
    </div>
  )
}

// ─── LogsPanel ───────────────────────────────────────────────────────────────

const LOG_TYPES = {
  API: 'api',
  WEBHOOK: 'webhook',
  LOCK: 'lock',
  ERROR: 'error',
  SUCCESS: 'success',
  WARN: 'warn',
  INFO: 'info',
}

