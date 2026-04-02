import { useState, useEffect } from 'react'
import { MessageSquare, Settings, Send, Activity, Webhook, Copy, Check, Trash2, Plus, FileText, Download, Upload, Eye, Pencil, X, ChevronRight, ChevronLeft, Save, MessageCircle, Server, Globe } from 'lucide-react'
import axios from 'axios'

// ─── Constants ───────────────────────────────────────────────────────────────

const API_BASE = '/api'
const STORAGE_KEY = 'wa-prueba-config'
const TEMPLATES_KEY = 'wa-prueba-templates'
const CRM_KEY = 'wa-prueba-crm'

const TABS = {
  SEND: 'send',
  TEMPLATES: 'templates',
  CONFIG: 'config',
  CRM: 'crm',
  CONVERSATIONS: 'conversations',
  LOGS: 'logs',
  WEBHOOK: 'webhook',
}

const TEMPLATE_CATEGORIES = [
  { value: 'MARKETING', label: 'Marketing', color: 'bg-purple-600' },
  { value: 'UTILITY', label: 'Utility', color: 'bg-blue-600' },
  { value: 'AUTHENTICATION', label: 'Authentication', color: 'bg-amber-600' },
  { value: 'SERVICE', label: 'Service', color: 'bg-green-600' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'en_US', label: 'English (US)' },
  { value: 'es_AR', label: 'Español (Argentina)' },
  { value: 'pt_BR', label: 'Português (Brasil)' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

function loadTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveTemplates(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function generateId() {
  return `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function countVariables(text) {
  const matches = text?.match(/\{\{(\d+)\}\}/g)
  if (!matches) return 0
  return Math.max(...matches.map(m => parseInt(m.replace(/\{\{|\}\}/g, ''))))
}

function renderPreview(text) {
  if (!text) return ''
  return text.replace(/\{\{(\d+)\}\}/g, (match) => {
    return `<span class="px-1.5 py-0.5 rounded bg-green-600/30 text-green-300 text-xs font-mono">${match}</span>`
  })
}

// ─── ConfigPanel ─────────────────────────────────────────────────────────────

function ConfigPanel({ config, onSave, onClear }) {
  const [form, setForm] = useState(config || {
    baseUrl: 'https://graph.facebook.com/v22.0',
    phoneNumberId: '',
    accessToken: '',
    appSecret: '',
    webhookVerifyToken: '',
    wabaId: '',
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function testConnection() {
    if (!form.phoneNumberId || !form.accessToken) {
      setTestResult({ ok: false, msg: 'Completá phoneNumberId y accessToken' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await axios.get(`${form.baseUrl}/${form.phoneNumberId}`, {
        headers: { Authorization: `Bearer ${form.accessToken}` },
      })
      if (res.data.error) {
        setTestResult({ ok: false, msg: res.data.error.message })
      } else {
        setTestResult({ ok: true, msg: `Conectado — ${res.data.display_phone_number || form.phoneNumberId}` })
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message
      setTestResult({ ok: false, msg })
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    saveConfig(form)
    onSave(form)
  }

  const fields = [
    { key: 'baseUrl', label: 'API Base URL', placeholder: 'https://graph.facebook.com/v22.0', type: 'text' },
    { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '1023265770876372', type: 'text' },
    { key: 'accessToken', label: 'Access Token', placeholder: 'EAAmC6O5Qmok...', type: 'password' },
    { key: 'appSecret', label: 'App Secret', placeholder: 'Para verificar firma del webhook', type: 'password' },
    { key: 'webhookVerifyToken', label: 'Webhook Verify Token', placeholder: 'Tu token personalizado', type: 'text' },
    { key: 'wabaId', label: 'WABA ID (opcional)', placeholder: '1842664289565674', type: 'text' },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-400" />
          Configuración de WhatsApp
        </h2>
        <div className="grid gap-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={testConnection} disabled={testing} className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors">
            {testing ? 'Probando...' : 'Probar Conexión'}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">
            Guardar Config
          </button>
          <button onClick={() => { onClear(); setForm(fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), { baseUrl: 'https://graph.facebook.com/v22.0' })); setTestResult(null) }} className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${testResult.ok ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            {testResult.ok ? '✅' : '❌'} {testResult.msg}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SendPanel ───────────────────────────────────────────────────────────────

function SendPanel({ config, templates, crmConfig }) {
  const [phone, setPhone] = useState('')
  const [body, setBody] = useState('')
  const [contactId, setContactId] = useState('')
  const [mode, setMode] = useState('text')
  const [sendVia, setSendVia] = useState('direct') // 'direct' or 'crm'
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateParams, setTemplateParams] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const selectedTpl = templates.find(t => t.id === selectedTemplateId)

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

      const apiBase = window.location.hostname === 'localhost' ? '' : (crmConfig.baseUrl || '')
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sendVia === 'direct' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Directo a Meta
          </button>
          <button
            onClick={() => setSendVia('crm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sendVia === 'crm' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                Contact ID (UUID del CRM)
              </label>
              <input
                type="text"
                value={contactId}
                onChange={e => setContactId(e.target.value)}
                placeholder="46b432d9-1138-4e12-a262-c82ae17d3d21"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">ID del contacto en la base de datos del CRM</p>
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

function TemplatesPanel() {
  const [templates, setTemplates] = useState(() => loadTemplates())
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [previewTpl, setPreviewTpl] = useState(null)

  // Wizard state
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 4

  // Step 1: Basic info
  const [name, setName] = useState('')
  const [category, setCategory] = useState('UTILITY')
  const [language, setLanguage] = useState('en')

  // Step 2: Header
  const [hasHeader, setHasHeader] = useState(false)
  const [headerText, setHeaderText] = useState('')

  // Step 3: Body (the message)
  const [bodyText, setBodyText] = useState('')

  // Step 4: Footer + buttons
  const [hasFooter, setHasFooter] = useState(false)
  const [footerText, setFooterText] = useState('')

  function resetForm() {
    setStep(1)
    setName('')
    setCategory('UTILITY')
    setLanguage('en')
    setHasHeader(false)
    setHeaderText('')
    setBodyText('')
    setHasFooter(false)
    setFooterText('')
    setEditing(null)
    setShowForm(false)
  }

  function handleEdit(tpl) {
    const headerComp = tpl.components.find(c => c.type === 'header')
    const bodyComp = tpl.components.find(c => c.type === 'body')
    const footerComp = tpl.components.find(c => c.type === 'footer')

    setName(tpl.name)
    setCategory(tpl.category)
    setLanguage(tpl.language)
    setHasHeader(!!headerComp)
    setHeaderText(headerComp?.text || '')
    setBodyText(bodyComp?.text || '')
    setHasFooter(!!footerComp)
    setFooterText(footerComp?.text || '')
    setEditing(tpl.id)
    setStep(1)
    setShowForm(true)
  }

  function handleSave() {
    if (!name.trim() || !bodyText.trim()) return

    const components = []
    if (hasHeader && headerText.trim()) {
      components.push({ type: 'header', text: headerText.trim() })
    }
    components.push({ type: 'body', text: bodyText.trim() })
    if (hasFooter && footerText.trim()) {
      components.push({ type: 'footer', text: footerText.trim() })
    }

    const tplData = {
      name: name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category,
      language,
      components,
    }

    if (editing) {
      const updated = templates.map(t =>
        t.id === editing ? { ...t, ...tplData, updatedAt: new Date().toISOString() } : t
      )
      setTemplates(updated)
      saveTemplates(updated)
    } else {
      const newTpl = { id: generateId(), ...tplData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      const updated = [...templates, newTpl]
      setTemplates(updated)
      saveTemplates(updated)
    }
    resetForm()
  }

  function handleDelete(id) {
    const updated = templates.filter(t => t.id !== id)
    setTemplates(updated)
    saveTemplates(updated)
    if (previewTpl?.id === id) setPreviewTpl(null)
  }

  function exportTemplates() {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `whatsapp-templates-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importTemplates(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (Array.isArray(imported)) {
          const merged = [...templates]
          imported.forEach(tpl => {
            if (!merged.find(existing => existing.id === tpl.id)) {
              merged.push(tpl)
            }
          })
          setTemplates(merged)
          saveTemplates(merged)
        }
      } catch { alert('Archivo JSON inválido') }
    }
    reader.readAsText(file)
  }

  function canNext() {
    if (step === 1) return name.trim().length > 0
    if (step === 2) return true // header is optional
    if (step === 3) return bodyText.trim().length > 0
    if (step === 4) return true // footer is optional
    return false
  }

  const stepLabels = ['Info Básica', 'Encabezado', 'Mensaje', 'Pie + Guardar']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            Templates ({templates.length})
          </h2>
          <div className="flex gap-2">
            <button onClick={exportTemplates} disabled={templates.length === 0} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-40 transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar JSON
            </button>
            <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" /> Importar
              <input type="file" accept=".json" onChange={importTemplates} className="hidden" />
            </label>
            <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-500 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nuevo Template
            </button>
          </div>
        </div>

        {/* Template list */}
        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">No hay templates guardados</p>
            <p className="text-sm">Creá uno nuevo o importá un archivo JSON</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {templates.map(tpl => {
              const cat = TEMPLATE_CATEGORIES.find(c => c.value === tpl.category)
              const bodyText = tpl.components.find(c => c.type === 'body')?.text || ''
              const varCount = countVariables(bodyText)

              return (
                <div key={tpl.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${cat?.color || 'bg-slate-600'}`}>
                        {tpl.category}
                      </span>
                      <span className="text-xs text-slate-500">{tpl.language}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setPreviewTpl(previewTpl?.id === tpl.id ? null : tpl)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Vista previa">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEdit(tpl)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Editar">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(tpl.id)} className="p-1.5 rounded hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors" title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{bodyText || 'Sin texto'}</p>
                  {varCount > 0 && <span className="text-xs text-green-400">{varCount} variable{varCount > 1 ? 's' : ''}</span>}

                  {previewTpl?.id === tpl.id && (
                    <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-700">
                      <div className="text-xs text-slate-500 mb-2">Vista previa:</div>
                      {tpl.components.filter(c => c.type === 'header').map((c, i) => (
                        <div key={i} className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700">{c.text}</div>
                      ))}
                      {tpl.components.filter(c => c.type === 'body').map((c, i) => (
                        <div key={i} className="text-sm text-white whitespace-pre-wrap mb-2" dangerouslySetInnerHTML={{ __html: renderPreview(c.text) }} />
                      ))}
                      {tpl.components.filter(c => c.type === 'footer').map((c, i) => (
                        <div key={i} className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-800">{c.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="p-6 pb-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editing ? 'Editar Template' : 'Nuevo Template'}
                </h3>
                <button onClick={resetForm} className="p-1.5 rounded hover:bg-slate-700 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1">
                {stepLabels.map((label, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      i + 1 < step ? 'bg-green-600 text-white' :
                      i + 1 === step ? 'bg-green-600 text-white' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {i + 1 < step ? '✓' : i + 1}
                    </div>
                    <div className={`hidden sm:block text-xs ml-1 ${i + 1 === step ? 'text-green-400' : 'text-slate-500'}`}>
                      {label}
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 ${i + 1 < step ? 'bg-green-600' : 'bg-slate-700'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="p-6">
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 1: Información Básica</h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Template *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                      placeholder="order_confirmation"
                      className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Solo minúsculas, números y guiones bajos</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
                      <select value={category} onChange={e => setCategory(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                        {TEMPLATE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Idioma</label>
                      <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500">
                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Header */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 2: Encabezado (opcional)</h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} className="rounded border-slate-600 bg-slate-950 text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-slate-300">Incluir encabezado</span>
                  </label>

                  {hasHeader && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Texto del encabezado</label>
                      <input
                        type="text"
                        value={headerText}
                        onChange={e => setHeaderText(e.target.value)}
                        placeholder="Confirmación de Pedido"
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Body */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 3: Cuerpo del Mensaje *</h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Texto del mensaje</label>
                    <textarea
                      value={bodyText}
                      onChange={e => setBodyText(e.target.value)}
                      placeholder="Hola {'{{1}}'}, tu pedido {'{{2}}'} fue enviado por {'{{3}}'}."
                      rows={6}
                      className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Usá {'{{1}}'}, {'{{2}}'}, etc. para variables dinámicas
                    </p>
                    {countVariables(bodyText) > 0 && (
                      <p className="text-xs text-green-400 mt-1">
                        {countVariables(bodyText)} variable{countVariables(bodyText) > 1 ? 's' : ''} detectada{countVariables(bodyText) > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Live preview */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-2">Vista previa:</div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      {hasHeader && headerText && (
                        <div className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700">{headerText}</div>
                      )}
                      <div className="text-sm text-white whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderPreview(bodyText) }} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Footer + Save */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-300">Paso 4: Pie y Guardar</h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hasFooter} onChange={e => setHasFooter(e.target.checked)} className="rounded border-slate-600 bg-slate-950 text-green-600 focus:ring-green-500" />
                    <span className="text-sm text-slate-300">Incluir pie de mensaje</span>
                  </label>

                  {hasFooter && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Texto del pie</label>
                      <input
                        type="text"
                        value={footerText}
                        onChange={e => setFooterText(e.target.value)}
                        placeholder="Reply STOP to opt out"
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                  )}

                  {/* Final preview */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-700">
                    <div className="text-xs text-slate-500 mb-2">Vista previa final:</div>
                    <div className="bg-slate-800 rounded-lg p-3 max-w-sm mx-auto">
                      {hasHeader && headerText && (
                        <div className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700">{headerText}</div>
                      )}
                      <div className="text-sm text-white whitespace-pre-wrap mb-1" dangerouslySetInnerHTML={{ __html: renderPreview(bodyText) }} />
                      {hasFooter && footerText && (
                        <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700">{footerText}</div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-400">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">Nombre:</span> {name || '(vacío)'}</div>
                      <div><span className="text-slate-500">Categoría:</span> {category}</div>
                      <div><span className="text-slate-500">Idioma:</span> {language}</div>
                      <div><span className="text-slate-500">Variables:</span> {countVariables(bodyText)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer navigation */}
            <div className="p-6 pt-0 flex items-center justify-between">
              <button
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="text-xs text-slate-500">Paso {step} de {TOTAL_STEPS}</span>

              {step < TOTAL_STEPS ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canNext()}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || !bodyText.trim()}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editing ? 'Guardar Cambios' : 'Crear Template'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CRM Config Panel ────────────────────────────────────────────────────────

function CrmPanel({ crmConfig, onSave, onClear }) {
  const [form, setForm] = useState(crmConfig || {
    baseUrl: 'http://localhost:8080',
    token: '',
    workspaceId: '',
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function testConnection() {
    if (!form.baseUrl || !form.token) {
      setTestResult({ ok: false, msg: 'Completá baseUrl y token' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      // Use proxy when running on localhost
      const apiBase = window.location.hostname === 'localhost' ? '' : form.baseUrl
      const res = await axios.get(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${form.token}` },
      })
      setTestResult({ ok: true, msg: `Conectado — ${res.data.email || res.data.name || 'OK'}` })
    } catch (err) {
      // Try actuator health as fallback
      try {
        const apiBase = window.location.hostname === 'localhost' ? '' : form.baseUrl
        const health = await axios.get(`${apiBase}/actuator/health`)
        setTestResult({ ok: true, msg: `Backend UP (${health.data.status}), pero /api/auth/me falló — verificá el token` })
      } catch {
        const msg = err.response?.data?.message || err.message
        setTestResult({ ok: false, msg })
      }
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    localStorage.setItem(CRM_KEY, JSON.stringify(form))
    onSave(form)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-green-400" />
          Configuración del CRM
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Configurá la conexión al backend del CRM para enviar mensajes y ver conversaciones.
        </p>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Backend URL</label>
            <input
              type="text"
              value={form.baseUrl}
              onChange={e => handleChange('baseUrl', e.target.value)}
              placeholder="http://localhost:8080"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">JWT Token</label>
            <input
              type="password"
              value={form.token}
              onChange={e => handleChange('token', e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiJ9..."
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <p className="text-xs text-slate-500 mt-1">Obtené el token haciendo login en el CRM</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Workspace ID (UUID)</label>
            <input
              type="text"
              value={form.workspaceId}
              onChange={e => handleChange('workspaceId', e.target.value)}
              placeholder="46b432d9-1138-4e12-a262-c82ae17d3d21"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={testConnection} disabled={testing} className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors">
            {testing ? 'Probando...' : 'Probar Conexión'}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors">
            Guardar
          </button>
          <button onClick={() => { onClear(); setForm({ baseUrl: 'http://localhost:8080', token: '', workspaceId: '' }); setTestResult(null) }} className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {testResult && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${testResult.ok ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            {testResult.ok ? '✅' : '❌'} {testResult.msg}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Conversations Panel ─────────────────────────────────────────────────────

function ConversationsPanel({ crmConfig }) {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Use proxy URL when running on same host, direct URL otherwise
  const apiBase = window.location.hostname === 'localhost' ? '' : (crmConfig?.baseUrl || '')

  async function fetchConversations() {
    if (!crmConfig?.token) {
      setError('Configurá el CRM primero')
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
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages(convId) {
    if (!crmConfig?.token) return
    try {
      const res = await axios.get(`${apiBase}/api/conversations/${convId}/messages?page=0&size=100`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      setMessages(res.data.content || [])
      setSelectedConv(convId)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  useEffect(() => {
    if (crmConfig?.token) fetchConversations()
  }, [crmConfig])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            Conversaciones ({conversations.length})
          </h2>
          <button onClick={fetchConversations} disabled={loading} className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-50 transition-colors">
            {loading ? 'Cargando...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 text-red-300 border border-red-700 text-sm">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Conversation list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversations.length === 0 && !loading && (
              <p className="text-slate-500 text-center py-8">Sin conversaciones</p>
            )}
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => fetchMessages(conv.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedConv === conv.id
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">
                    {conv.contactName || conv.contactPhone || 'Contacto'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {conv.channel}
                  </span>
                </div>
                {conv.lastMessage && (
                  <p className="text-xs text-slate-400 truncate mt-1">{conv.lastMessage}</p>
                )}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4 max-h-96 overflow-y-auto">
            {!selectedConv ? (
              <p className="text-slate-500 text-center py-8">Seleccioná una conversación</p>
            ) : messages.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Sin mensajes</p>
            ) : (
              <div className="space-y-2">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg text-sm ${
                      msg.direction === 'OUTBOUND'
                        ? 'bg-green-900/20 border border-green-800/30 ml-4'
                        : 'bg-slate-800/50 border border-slate-700 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${
                        msg.direction === 'OUTBOUND' ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {msg.direction === 'OUTBOUND' ? '→ Enviado' : '← Recibido'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {msg.sentAt ? formatTime(msg.sentAt) : ''}
                      </span>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{msg.body}</p>
                    {msg.externalId && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">extId: {msg.externalId}</p>
                    )}
                    {msg.status && (
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                        msg.status === 'SENT' ? 'bg-green-900/30 text-green-300' :
                        msg.status === 'DELIVERED' ? 'bg-blue-900/30 text-blue-300' :
                        msg.status === 'READ' ? 'bg-purple-900/30 text-purple-300' :
                        msg.status === 'FAILED' ? 'bg-red-900/30 text-red-300' :
                        msg.status === 'SENDING' ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {msg.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LogsPanel ───────────────────────────────────────────────────────────────

function LogsPanel({ crmConfig }) {
  const [logs, setLogs] = useState([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => { fetchLogs() }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  async function fetchLogs() {
    if (!crmConfig?.token) {
      setLogs(prev => [{
        time: new Date().toISOString(), type: 'warn',
        msg: '⚠️ Configurá el CRM primero (tab CRM) para ver logs del backend',
      }, ...prev].slice(0, 100))
      return
    }

    setLoading(true)
    try {
      const apiBase = window.location.hostname === 'localhost' ? '' : (crmConfig.baseUrl || '')
      const res = await axios.get(`${apiBase}/api/conversations?page=0&size=10`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })
      const convs = res.data.content || []
      setLogs(prev => [{
        time: new Date().toISOString(), type: 'info',
        msg: `📋 Conversaciones: ${convs.length} total${convs.length > 0 ? ` — Última: ${convs[0].contactName || convs[0].contactPhone || 'N/A'} (${convs[0].channel})` : ''}`,
        data: convs.length > 0 ? { lastConversation: convs[0] } : null,
      }, ...prev].slice(0, 100))
    } catch (err) {
      setLogs(prev => [{
        time: new Date().toISOString(), type: 'error',
        msg: `❌ Error: ${err.response?.data?.message || err.response?.data?.error || err.message}`,
      }, ...prev].slice(0, 100))
    } finally {
      setLoading(false)
    }
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

        {!crmConfig?.token && (
          <div className="mb-4 p-3 rounded-lg bg-amber-900/20 text-amber-300 border border-amber-800/50 text-sm">
            ⚠️ Necesitás configurar el CRM en la tab <strong>CRM</strong> para ver logs del backend.
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 && <p className="text-slate-500 text-center py-8">Sin logs aún. Enviá un mensaje o hacé refresh.</p>}
          {logs.map((log, i) => (
            <div key={i} className={`p-3 rounded-lg text-sm border ${
              log.type === 'error' ? 'bg-red-900/20 border-red-800/50 text-red-300' :
              log.type === 'success' ? 'bg-green-900/20 border-green-800/50 text-green-300' :
              log.type === 'warn' ? 'bg-amber-900/20 border-amber-800/50 text-amber-300' :
              'bg-slate-900/50 border-slate-700/50 text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">{formatTime(log.time)}</span>
                <span className="text-xs uppercase font-bold tracking-wider">{log.type}</span>
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

function WebhookSimulator({ config }) {
  const [payload, setPayload] = useState(JSON.stringify({
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WABA_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: { display_phone_number: '14155552345', phone_number_id: 'PHONE_NUMBER_ID' },
          contacts: [{ profile: { name: 'Test User' }, wa_id: '14155551234' }],
          messages: [{
            from: '14155551234',
            id: 'wamid.test-message-id-12345',
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

      const res = await fetch('/webhooks/whatsapp', {
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
              metadata: { display_phone_number: '14155552345', phone_number_id: 'PHONE_NUMBER_ID' },
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
              metadata: { display_phone_number: '14155552345', phone_number_id: 'PHONE_NUMBER_ID' },
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
              metadata: { display_phone_number: '14155552345', phone_number_id: 'PHONE_NUMBER_ID' },
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
              metadata: { display_phone_number: '14155552345', phone_number_id: 'PHONE_NUMBER_ID' },
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

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Webhook className="w-5 h-5 text-green-400" /> Simulador de Webhook
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Simula payloads de Meta para probar el endpoint del webhook sin necesidad de ngrok.
          Calcula automáticamente la firma HMAC-SHA256.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {templates.map(t => (
            <button key={t.label} onClick={() => setPayload(JSON.stringify(t.payload, null, 2))} className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 transition-colors">
              {t.label}
            </button>
          ))}
        </div>
        <textarea
          value={payload}
          onChange={e => setPayload(e.target.value)}
          rows={16}
          className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white font-mono text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
        />
        <button onClick={simulateWebhook} disabled={sending} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 disabled:opacity-50 transition-colors">
          <Webhook className="w-4 h-4" /> {sending ? 'Enviando...' : 'Simular Webhook'}
        </button>
        {result && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${result.ok ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-red-900/30 text-red-300 border border-red-700'}`}>
            {result.ok ? '✅' : '❌'} {result.msg}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.SEND)
  const [config, setConfig] = useState(() => loadConfig())
  const [templates, setTemplates] = useState(() => loadTemplates())
  const [crmConfig, setCrmConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(CRM_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })
  const [copied, setCopied] = useState(false)

  const tabs = [
    { id: TABS.SEND, label: 'Enviar', icon: MessageSquare },
    { id: TABS.TEMPLATES, label: 'Templates', icon: FileText },
    { id: TABS.CONFIG, label: 'Meta Config', icon: Settings },
    { id: TABS.CRM, label: 'CRM', icon: Server },
    { id: TABS.CONVERSATIONS, label: 'Conversaciones', icon: MessageCircle },
    { id: TABS.LOGS, label: 'Logs', icon: Activity },
    { id: TABS.WEBHOOK, label: 'Webhook', icon: Webhook },
  ]

  function copyCurl() {
    if (!config?.phoneNumberId || !config?.accessToken) return
    const curl = `curl -X POST '${config.baseUrl}/${config.phoneNumberId}/messages' \\
  -H 'Authorization: Bearer ${config.accessToken}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "messaging_product": "whatsapp",
    "to": "5491155551234",
    "type": "text",
    "text": { "body": "Hola desde CRM!" }
  }'`
    navigator.clipboard.writeText(curl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">WhatsApp Prueba</h1>
              <p className="text-xs text-slate-400">Meta Cloud API v22.0 + CRM Backend</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {config?.phoneNumberId && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-900/30 text-green-400 text-xs border border-green-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Meta
              </span>
            )}
            {crmConfig?.token && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs border border-blue-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> CRM
              </span>
            )}
            <button onClick={copyCurl} disabled={!config?.accessToken} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 disabled:opacity-40 transition-colors" title="Copiar curl">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'cURL'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4">
        <nav className="flex gap-1 mt-4 border-b border-slate-800 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === TABS.SEND && <SendPanel config={config} templates={templates} crmConfig={crmConfig} />}
        {activeTab === TABS.TEMPLATES && <TemplatesPanel />}
        {activeTab === TABS.CONFIG && <ConfigPanel config={config} onSave={setConfig} onClear={() => { localStorage.removeItem(STORAGE_KEY); setConfig(null) }} />}
        {activeTab === TABS.CRM && <CrmPanel crmConfig={crmConfig} onSave={setCrmConfig} onClear={() => { localStorage.removeItem(CRM_KEY); setCrmConfig(null) }} />}
        {activeTab === TABS.CONVERSATIONS && <ConversationsPanel crmConfig={crmConfig} />}
        {activeTab === TABS.LOGS && <LogsPanel crmConfig={crmConfig} />}
        {activeTab === TABS.WEBHOOK && <WebhookSimulator config={config} />}
      </main>

      <footer className="border-t border-slate-800 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-slate-500">
          <span>WhatsApp Business API — Prueba & Testing</span>
          <span>Puerto: 5174 → Proxy: localhost:8080</span>
        </div>
      </footer>
    </div>
  )
}
