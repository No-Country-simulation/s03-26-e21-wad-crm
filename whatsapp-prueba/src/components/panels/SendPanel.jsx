export default function SendPanel({ config, templates, crmConfig }) {
  const [phone, setPhone] = useState('')
  const [body, setBody] = useState('')
  const [contactId, setContactId] = useState('')
  const [crmContacts, setCrmContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [mode, setMode] = useState('text')
  const [sendVia, setSendVia] = useState('direct') // 'direct' or 'crm'
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateParams, setTemplateParams] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const selectedTpl = templates.find(t => t.id === selectedTemplateId)

  // Load contacts from CRM when switching to CRM mode
  useEffect(() => {
    if (sendVia === 'crm' && crmConfig?.token && crmContacts.length === 0) {
      loadCrmContacts()
    }
  }, [sendVia, crmConfig])

  async function loadCrmContacts() {
    if (!crmConfig?.token) return
    setLoadingContacts(true)
    try {
      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8080' : (crmConfig.baseUrl || '')
      const res = await axios.get(`${apiBase}/api/contacts?page=0&size=100`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setCrmContacts(res.data.content || [])
    } catch (err) {
      console.error('Error loading contacts:', err)
    } finally {
      setLoadingContacts(false)
    }
  }

  async function handleSend() {
    if (sendVia === 'crm') {
      if (!crmConfig?.baseUrl || !crmConfig?.token) {
        setResult({ ok: false, msg: 'Configurá el CRM primero (tab CRM)' })
        return
      }
      if (!contactId) {
        setResult({ ok: false, msg: 'Completá el Contact ID' })
        return
      }
      return handleSendViaCrm()
    }

    // Direct Meta API
    if (!config?.phoneNumberId || !config?.accessToken) {
      setResult({ ok: false, msg: 'Configurá las credenciales primero (tab Configuración)' })
      return
    }
    if (!phone) {
      setResult({ ok: false, msg: 'Completá el teléfono destino' })
      return
    }

    setSending(true)
    setResult(null)
    const cleanPhone = phone.replace(/[^0-9]/g, '')

    try {
      let res
      if (mode === 'template') {
        if (!selectedTpl) {
          setResult({ ok: false, msg: 'Seleccioná un template guardado' })
          setSending(false)
          return
        }

        const bodyComp = selectedTpl.components.find(c => c.type === 'body')
        let finalBody = bodyComp?.text || ''
        const params = templateParams.split(',').map(p => p.trim()).filter(Boolean)
        params.forEach((val, i) => {
          finalBody = finalBody.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'), val)
        })

        const apiComponents = []
        const headerComp = selectedTpl.components.find(c => c.type === 'header')
        if (headerComp) {
          apiComponents.push({ type: 'header', parameters: [] })
        }

        const varCount = countVariables(bodyComp?.text || '')
        if (varCount > 0) {
          apiComponents.push({
            type: 'body',
            parameters: params.slice(0, varCount).map(p => ({ type: 'text', text: p })),
          })
        }

        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'template',
          template: {
            name: selectedTpl.name,
            language: { code: selectedTpl.language },
            ...(apiComponents.length > 0 && { components: apiComponents }),
          },
        }

        res = await axios.post(
          `${config.baseUrl}/${config.phoneNumberId}/messages`,
          payload,
          { headers: { Authorization: `Bearer ${config.accessToken}`, 'Content-Type': 'application/json' } }
        )
      } else {
        if (!body) {
          setResult({ ok: false, msg: 'Completá el mensaje' })
          setSending(false)
          return
        }

        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: false, body },
        }

        res = await axios.post(
          `${config.baseUrl}/${config.phoneNumberId}/messages`,
          payload,
          { headers: { Authorization: `Bearer ${config.accessToken}`, 'Content-Type': 'application/json' } }
        )
      }

      const externalId = res.data?.messages?.[0]?.id
      setResult({ ok: true, msg: `Enviado! ID: ${externalId || 'N/A'}`, data: res.data })
      setBody('')
      setTemplateParams('')
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message
      const code = err.response?.data?.error?.code
      setResult({ ok: false, msg: `Error ${code ? `(${code})` : ''}: ${msg}`, data: err.response?.data })
    } finally {
      setSending(false)
    }
  }

  async function handleSendViaCrm() {
    setSending(true)
    setResult(null)

    try {
      const payload = {
        contactId,
        body: body || `[Template: ${selectedTpl?.name || 'N/A'}]`,
      }

      if (mode === 'template' && selectedTpl) {
        payload.templateName = selectedTpl.name
        payload.templateLanguage = selectedTpl.language
        const params = templateParams.split(',').map(p => p.trim()).filter(Boolean)
        if (params.length > 0) {
          payload.templateParameters = params.map(p => ({ type: 'text', value: p }))
        }
      }

      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8080' : (crmConfig.baseUrl || '')
      const res = await axios.post(
        `${apiBase}/api/whatsapp/send`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${crmConfig.token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      setResult({ ok: true, msg: `CRM: Enviado! msgId=${res.data.messageId}, externalId=${res.data.externalId}`, data: res.data })
      setBody('')
      setTemplateParams('')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message
      setResult({ ok: false, msg: `CRM Error: ${msg}`, data: err.response?.data })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-green-400" />
          Enviar Mensaje
        </h2>

        {/* Send via selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSendVia('direct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sendVia === 'direct' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
          >
            <Globe className="w-3.5 h-3.5" /> Directo a Meta
          </button>
          <button
            onClick={() => setSendVia('crm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sendVia === 'crm' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
          >
            <Server className="w-3.5 h-3.5" /> Vía CRM Backend
          </button>
        </div>

        {sendVia === 'direct' ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Teléfono destino <span className="text-slate-500">(E.164, sin +)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="5491155551234"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Contacto del CRM
              </label>
              {loadingContacts ? (
                <div className="text-sm text-slate-400 py-2">Cargando contactos...</div>
              ) : crmContacts.length === 0 ? (
                <div className="text-sm text-slate-400 py-2">
                  No hay contactos en el CRM. <button onClick={loadCrmContacts} className="text-green-400 underline">Reintentar</button>
                </div>
              ) : (
                <select
                  value={contactId}
                  onChange={e => setContactId(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">— Seleccioná un contacto —</option>
                  {crmContacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email || c.phone || 'sin email/teléfono'})</option>
                  ))}
                </select>
              )}
              <p className="text-xs text-slate-500 mt-1">Contactos cargados automáticamente del CRM</p>
            </div>
          </>
        )}

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('text')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'text' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            Texto Libre
          </button>
          <button onClick={() => setMode('template')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'template' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            Template ({templates.length})
          </button>
        </div>

        {mode === 'text' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Mensaje</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Hola, este es un mensaje de prueba desde el CRM..."
              rows={4}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{body.length}/4096 caracteres</p>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Template Guardado</label>
              <select
                value={selectedTemplateId}
                onChange={e => {
                  setSelectedTemplateId(e.target.value)
                  setTemplateParams('')
                }}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">— Seleccioná un template —</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.category}) — {t.language}</option>
                ))}
              </select>
            </div>

            {selectedTpl && (
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="text-xs text-slate-400 mb-2">Contenido del template:</div>
                {selectedTpl.components.filter(c => c.type === 'header').map((c, i) => (
                  <div key={i} className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700">{c.text}</div>
                ))}
                {selectedTpl.components.filter(c => c.type === 'body').map((c, i) => (
                  <div key={i} className="text-sm text-white whitespace-pre-wrap mb-1" dangerouslySetInnerHTML={{ __html: renderPreview(c.text) }} />
                ))}
                {selectedTpl.components.filter(c => c.type === 'footer').map((c, i) => (
                  <div key={i} className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">{c.text}</div>
                ))}
              </div>
            )}

            {selectedTpl && countVariables(selectedTpl.components.find(c => c.type === 'body')?.text || '') > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Parámetros <span className="text-slate-500">(separados por coma)</span>
                </label>
                <input
                  type="text"
                  value={templateParams}
                  onChange={e => setTemplateParams(e.target.value)}
                  placeholder="Juan, 12345, FedEx"
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}

            {selectedTpl && templateParams && (
              <div className="p-3 rounded-lg bg-green-900/10 border border-green-800/30">
                <div className="text-xs text-green-400 mb-1">Vista previa con parámetros:</div>
                {selectedTpl.components.filter(c => c.type === 'body').map((c, i) => {
                  let preview = c.text || ''
                  const params = templateParams.split(',').map(p => p.trim()).filter(Boolean)
                  params.forEach((val, idx) => {
                    preview = preview.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val)
                  })
                  return <div key={i} className="text-sm text-white whitespace-pre-wrap">{preview}</div>
                })}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Enviando...' : `Enviar ${sendVia === 'crm' ? 'vía CRM' : ''}`}
        </button>

        {result && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${result.ok ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            <div className="font-medium mb-1">{result.ok ? '✅ Enviado' : '❌ Error'}</div>
            <div>{result.msg}</div>
            {result.data && (
              <pre className="mt-2 text-xs bg-slate-900/50 p-2 rounded overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TemplatesPanel (Wizard por pasos) ───────────────────────────────────────

