export default function LogsPanel({ crmConfig }) {
  const [logs, setLogs] = useState([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => { fetchLogs() }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  async function fetchLogs() {
    if (!crmConfig?.token) {
      addLog('warn', '⚠️ Configurá el CRM primero (tab CRM) para ver logs del backend', LOG_TYPES.WARN)
      return
    }

    setLoading(true)
    try {
      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8080' : (crmConfig.baseUrl || '')
      const res = await axios.get(`${apiBase}/api/conversations?page=0&size=10`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      const convs = res.data.content || []
      addLog('info', `📋 Conversaciones: ${convs.length} total${convs.length > 0 ? ` — Última: ${convs[0].contactName || convs[0].contactPhone || 'N/A'} (${convs[0].channel})` : ''}`, LOG_TYPES.API, convs.length > 0 ? { lastConversation: convs[0] } : null)
    } catch (err) {
      addLog('error', `❌ Error: ${err.response?.data?.message || err.response?.data?.error || err.message}`, LOG_TYPES.ERROR)
    } finally {
      setLoading(false)
    }
  }

  function addLog(type, msg, category, data = null) {
    setLogs(prev => [{
      time: new Date().toISOString(), 
      type, 
      msg,
      category: category || LOG_TYPES.INFO,
      data
    }, ...prev].slice(0, 200))
  }

  const filteredLogs = selectedFilter === 'all' 
    ? logs 
    : logs.filter(log => log.category === selectedFilter)

  const logCounts = {
    all: logs.length,
    [LOG_TYPES.API]: logs.filter(l => l.category === LOG_TYPES.API).length,
    [LOG_TYPES.WEBHOOK]: logs.filter(l => l.category === LOG_TYPES.WEBHOOK).length,
    [LOG_TYPES.LOCK]: logs.filter(l => l.category === LOG_TYPES.LOCK).length,
    [LOG_TYPES.ERROR]: logs.filter(l => l.type === 'error').length,
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" /> Logs
          </h2>
          <div className="flex gap-2">
            <button onClick={fetchLogs} disabled={loading} className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-50 transition-colors">
              {loading ? 'Cargando...' : 'Refresh'}
            </button>
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${autoRefresh ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              Auto {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button onClick={() => setLogs([])} className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition-colors">Limpiar</button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 pb-3 border-b border-slate-700 overflow-x-auto">
          {['all', LOG_TYPES.API, LOG_TYPES.WEBHOOK, LOG_TYPES.LOCK, LOG_TYPES.ERROR].map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap font-medium transition-colors ${
                selectedFilter === filter
                  ? filter === LOG_TYPES.ERROR 
                    ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                    : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
              }`}
            >
              {filter.toUpperCase()} {logCounts[filter] > 0 && <span className="ml-1 text-xs bg-slate-950 px-2 py-0.5 rounded">{logCounts[filter]}</span>}
            </button>
          ))}
        </div>

        {!crmConfig?.token && (
          <div className="mb-4 p-3 rounded-lg bg-amber-900/20 text-amber-300 border border-amber-800/50 text-sm">
            ⚠️ Necesitás configurar el CRM en la tab <strong>CRM</strong> para ver logs del backend.
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 && (
            <p className="text-slate-500 text-center py-8">
              {logs.length === 0 ? 'Sin logs aún. Enviá un mensaje o hacé refresh.' : `Sin logs de tipo ${selectedFilter}`}
            </p>
          )}
           {filteredLogs.map((log, i) => (
             <div key={i} className={`p-3 rounded-lg text-sm border ${log.type === 'error' ? 'bg-red-900/20 border-red-800/50 text-red-300' :
               log.type === 'success' ? 'bg-green-900/20 border-green-800/50 text-green-300' :
                 log.type === 'warn' ? 'bg-amber-900/20 border-amber-800/50 text-amber-300' :
                   'bg-slate-900/50 border-slate-700/50 text-slate-300'
               }`}>
               <div className="flex items-center gap-2 flex-wrap">
                 <span className="text-xs text-slate-500 font-mono">{formatTime(log.time)}</span>
                 <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-950/50">{log.type}</span>
                 <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">{log.category}</span>
                 <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/50">{log.user} ({log.role})</span>
               </div>
               <div className="mt-1">{log.msg}</div>
               {log.data && <pre className="mt-2 text-xs bg-slate-950/50 p-2 rounded overflow-x-auto">{JSON.stringify(log.data, null, 2)}</pre>}
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}

// ─── WebhookSimulator ────────────────────────────────────────────────────────

export default function WebhookSimulator({ config }) {
  const [payload, setPayload] = useState(JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WABA_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { display_phone_number: '14155552345', phone_number_id: '1023265770876372' },
          contacts: [{ profile: { name: 'Test User' }, wa_id: '14155551234' }],
          messages: [{
            from: '14155551234',
            id: `wamid.test-${Date.now()}`,
            timestamp: String(Math.floor(Date.now() / 1000)),
            type: 'text',
            text: { body: 'Hola, este es un mensaje de prueba' },
          }],
        },
        field: 'messages',
      }],
    }],
  }, null, 2))
  const [result, setResult] = useState(null)
  const [sending, setSending] = useState(false)

  async function simulateWebhook() {
    if (!config?.appSecret) {
      setResult({ ok: false, msg: 'Necesitás configurar el App Secret para calcular la firma' })
      return
    }
    setSending(true)
    setResult(null)
    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(config.appSecret)
      const messageData = encoder.encode(payload)
      const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
      const hexSignature = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')

      const res = await fetch(`${BACKEND_BASE}/webhooks/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Hub-Signature-256': `sha256=${hexSignature}` },
        body: payload,
      })
      if (res.ok) {
        setResult({ ok: true, msg: `Webhook enviado — Status: ${res.status}` })
      } else {
        setResult({ ok: false, msg: `Error — Status: ${res.status} ${res.statusText}` })
      }
    } catch (err) {
      setResult({ ok: false, msg: err.message })
    } finally {
      setSending(false)
    }
  }

  const templates = [
    {
      label: 'Mensaje de texto',
      payload: {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'WABA_ID',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '14155552345', phone_number_id: '1023265770876372' },
              contacts: [{ profile: { name: 'Test User' }, wa_id: '14155551234' }],
              messages: [{
                from: '14155551234',
                id: `wamid.test-${Date.now()}`,
                timestamp: String(Math.floor(Date.now() / 1000)),
                type: 'text',
                text: { body: 'Hola, necesito ayuda con mi pedido' },
              }],
            },
            field: 'messages',
          }],
        }],
      },
    },
    {
      label: 'Status: delivered',
      payload: {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'WABA_ID',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '14155552345', phone_number_id: '1023265770876372' },
              statuses: [{
                id: 'wamid.test-message-id', status: 'delivered',
                timestamp: String(Math.floor(Date.now() / 1000)),
                recipient_id: '14155551234',
                conversation: { id: 'conv-123', origin: { type: 'utility' } },
                pricing: { billable: true, pricing_model: 'CBP', category: 'utility' },
              }],
            },
            field: 'messages',
          }],
        }],
      },
    },
    {
      label: 'Status: read',
      payload: {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'WABA_ID',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '14155552345', phone_number_id: '1023265770876372' },
              statuses: [{ id: 'wamid.test-message-id', status: 'read', timestamp: String(Math.floor(Date.now() / 1000)), recipient_id: '14155551234' }],
            },
            field: 'messages',
          }],
        }],
      },
    },
    {
      label: 'Status: failed',
      payload: {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'WABA_ID',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '14155552345', phone_number_id: '1023265770876372' },
              statuses: [{
                id: 'wamid.test-message-id', status: 'failed',
                timestamp: String(Math.floor(Date.now() / 1000)),
                recipient_id: '14155551234',
                errors: [{ code: 131030, title: 'Invalid recipient', message: 'Invalid phone number' }],
              }],
            },
            field: 'messages',
          }],
        }],
      },
    },
  ]

