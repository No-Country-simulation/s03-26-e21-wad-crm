/**
 * SendPanel - TypeScript Version
 * 
 * WhatsApp message sending panel
 * Features:
 * - Direct Meta API or CRM backend routing
 * - Text and template messaging
 * - Template parameter substitution
 * - CRM contact integration
 */

import { useState, useEffect, useCallback } from 'react'
import { Send, Globe, Server } from 'lucide-react'
import { WhatsAppConfig, WhatsAppTemplate, CRMConfig } from '@/utils/storage'
import { countVariables } from '@/utils/helpers'
import { useWhatsAppApi } from '@/hooks'

// ─── Types ────────────────────────────────────────────────────────────────────

type SendMode = 'text' | 'template'
type SendVia = 'direct' | 'crm'

interface SendResult {
  ok: boolean
  msg: string
  data?: any
}

interface CRMContact {
  id: string
  name: string
  email?: string
  phone?: string
}

interface SendPanelProps {
  config?: WhatsAppConfig | null
  templates: WhatsAppTemplate[]
  crmConfig?: CRMConfig | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPreview(text: string): string {
  return text
    .replace(/\{\{\d+\}\}/g, (match) => `<span class="bg-green-900/50 px-1 rounded">${match}</span>`)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SendPanel({ config, templates, crmConfig }: SendPanelProps) {
  // ─── State: Direct Mode ───────────────────────────────────────────────────
  const [phone, setPhone] = useState('')
  const [body, setBody] = useState('')

  // ─── State: CRM Mode ──────────────────────────────────────────────────────
  const [contactId, setContactId] = useState('')
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  // ─── State: Mode Selection ────────────────────────────────────────────────
  const [mode, setMode] = useState<SendMode>('text')
  const [sendVia, setSendVia] = useState<SendVia>('direct')

  // ─── State: Template ──────────────────────────────────────────────────────
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateParams, setTemplateParams] = useState('')

  // ─── State: Send Progress ─────────────────────────────────────────────────
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

  // ─── WhatsApp API Hook ────────────────────────────────────────────────────
  const api = useWhatsAppApi({ config, crmConfig, retries: 2 })

  // ─── Derived ──────────────────────────────────────────────────────────────
  const selectedTpl = templates.find((t) => t.id === selectedTemplateId)
  const apiBase =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : crmConfig?.baseUrl || ''

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (sendVia === 'crm' && crmConfig?.token && crmContacts.length === 0) {
      loadCrmContacts()
    }
  }, [sendVia, crmConfig?.token])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const loadCrmContacts = useCallback(async () => {
    if (!crmConfig?.token) return

    setLoadingContacts(true)
    try {
      const res = await fetch(`${apiBase}/api/contacts?page=0&size=100`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      setCrmContacts(data.content || [])
    } catch (err) {
      console.error('Error loading contacts:', err)
    } finally {
      setLoadingContacts(false)
    }
  }, [crmConfig?.token, apiBase])

  async function handleSend() {
    // ─── CRM Mode ─────────────────────────────────────────────────────────
    if (sendVia === 'crm') {
      if (!crmConfig?.baseUrl || !crmConfig?.token) {
        setResult({ ok: false, msg: '❌ Configurá el CRM primero (tab CRM)' })
        return
      }
      if (!contactId) {
        setResult({ ok: false, msg: '❌ Completá el Contact ID' })
        return
      }
      return handleSendViaCrm()
    }

    // ─── Direct Meta API Mode ────────────────────────────────────────────
    if (!config?.phoneNumberId || !config?.accessToken) {
      setResult({ ok: false, msg: '❌ Configurá las credenciales primero (tab Configuración)' })
      return
    }
    if (!phone) {
      setResult({ ok: false, msg: '❌ Completá el teléfono destino' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '')

      let payload: any

      if (mode === 'template') {
        if (!selectedTpl) {
          setResult({ ok: false, msg: '❌ Seleccioná un template guardado' })
          setSending(false)
          return
        }

        const bodyComp = selectedTpl.components.find((c) => c.type === 'body')
        let finalBody = bodyComp?.text || ''
        const params = templateParams.split(',').map((p) => p.trim()).filter(Boolean)

        params.forEach((val, i) => {
          finalBody = finalBody.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'), val)
        })

        const apiComponents: any[] = []
        const headerComp = selectedTpl.components.find((c) => c.type === 'header')

        if (headerComp) {
          apiComponents.push({ type: 'header', parameters: [] })
        }

        const varCount = countVariables(bodyComp?.text || '')
        if (varCount > 0) {
          apiComponents.push({
            type: 'body',
            parameters: params.slice(0, varCount).map((p) => ({ type: 'text', text: p })),
          })
        }

        payload = {
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
      } else {
        if (!body) {
          setResult({ ok: false, msg: '❌ Completá el mensaje' })
          setSending(false)
          return
        }

        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: false, body },
        }
      }

      const res = await fetch(`${config.baseUrl}/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        const msg = data.error?.message || `HTTP ${res.status}`
        const code = data.error?.code
        setResult({ ok: false, msg: `❌ Error ${code ? `(${code})` : ''}: ${msg}`, data })
        return
      }

      const data = await res.json()
      const externalId = data.messages?.[0]?.id
      setResult({ ok: true, msg: `✅ Enviado! ID: ${externalId || 'N/A'}`, data })
      setBody('')
      setTemplateParams('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setResult({ ok: false, msg: `❌ Error: ${msg}` })
    } finally {
      setSending(false)
    }
  }

  async function handleSendViaCrm() {
    setSending(true)
    setResult(null)

    try {
      const payload: any = {
        contactId,
        body: body || `[Template: ${selectedTpl?.name || 'N/A'}]`,
      }

      if (mode === 'template' && selectedTpl) {
        payload.templateName = selectedTpl.name
        payload.templateLanguage = selectedTpl.language
        const params = templateParams.split(',').map((p) => p.trim()).filter(Boolean)

        if (params.length > 0) {
          payload.templateParameters = params.map((p) => ({ type: 'text', value: p }))
        }
      }

      const res = await fetch(`${apiBase}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${crmConfig?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        const msg = data.message || data.error || `HTTP ${res.status}`
        setResult({ ok: false, msg: `❌ CRM Error: ${msg}`, data })
        return
      }

      const data = await res.json()
      setResult({
        ok: true,
        msg: `✅ CRM: Enviado! msgId=${data.messageId}, externalId=${data.externalId}`,
        data,
      })
      setBody('')
      setTemplateParams('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setResult({ ok: false, msg: `❌ CRM Error: ${msg}` })
    } finally {
      setSending(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-green-400" />
          Enviar Mensaje
        </h2>

        {/* Send Via Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSendVia('direct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sendVia === 'direct'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Directo a Meta
          </button>
          <button
            onClick={() => setSendVia('crm')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sendVia === 'crm'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Vía CRM Backend
          </button>
        </div>

        {/* Phone / Contact Selector */}
        {sendVia === 'direct' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Teléfono destino <span className="text-slate-500">(E.164, sin +)</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5491155551234"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Contacto del CRM
            </label>
            {loadingContacts ? (
              <div className="text-sm text-slate-400 py-2">Cargando contactos...</div>
            ) : crmContacts.length === 0 ? (
              <div className="text-sm text-slate-400 py-2">
                No hay contactos en el CRM.{' '}
                <button
                  onClick={loadCrmContacts}
                  className="text-green-400 underline hover:no-underline"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
              >
                <option value="">— Seleccioná un contacto —</option>
                {crmContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email || c.phone || 'sin email/teléfono'})
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-slate-500 mt-1">Contactos cargados automáticamente del CRM</p>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'text'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Texto Libre
          </button>
          <button
            onClick={() => setMode('template')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'template'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Template ({templates.length})
          </button>
        </div>

        {/* Text Mode Input */}
        {mode === 'text' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Mensaje</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hola, este es un mensaje de prueba desde el CRM..."
              rows={4}
              maxLength={4096}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              {body.length}/4096 caracteres
            </p>
          </div>
        ) : (
          /* Template Mode */
          <div className="space-y-4 mb-4">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Template Guardado
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value)
                  setTemplateParams('')
                }}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
              >
                <option value="">— Seleccioná un template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category}) — {t.language}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Preview */}
            {selectedTpl && (
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className="text-xs text-slate-400 mb-2 font-semibold">
                  📋 Contenido del template:
                </div>
                {selectedTpl.components
                  .filter((c) => c.type === 'header')
                  .map((c, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-400 font-medium mb-1 pb-1 border-b border-slate-700"
                    >
                      {c.text}
                    </div>
                  ))}
                {selectedTpl.components
                  .filter((c) => c.type === 'body')
                  .map((c, i) => (
                    <div
                      key={i}
                      className="text-sm text-white whitespace-pre-wrap mb-1"
                      dangerouslySetInnerHTML={{ __html: renderPreview(c.text || '') }}
                    />
                  ))}
                {selectedTpl.components
                  .filter((c) => c.type === 'footer')
                  .map((c, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-700"
                    >
                      {c.text}
                    </div>
                  ))}
              </div>
            )}

            {/* Template Parameters */}
            {selectedTpl &&
              countVariables(selectedTpl.components.find((c) => c.type === 'body')?.text || '') >
                0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Parámetros <span className="text-slate-500">(separados por coma)</span>
                  </label>
                  <input
                    type="text"
                    value={templateParams}
                    onChange={(e) => setTemplateParams(e.target.value)}
                    placeholder="Juan, 12345, FedEx"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                  />
                </div>
              )}

            {/* Parameters Preview */}
            {selectedTpl && templateParams && (
              <div className="p-3 rounded-lg bg-green-900/10 border border-green-800/30">
                <div className="text-xs text-green-400 mb-1 font-semibold">
                  ✨ Vista previa con parámetros:
                </div>
                {selectedTpl.components
                  .filter((c) => c.type === 'body')
                  .map((c, i) => {
                    let preview = c.text || ''
                    const params = templateParams
                      .split(',')
                      .map((p) => p.trim())
                      .filter(Boolean)
                    params.forEach((val, idx) => {
                      preview = preview.replace(
                        new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'),
                        val
                      )
                    })
                    return (
                      <div key={i} className="text-sm text-white whitespace-pre-wrap">
                        {preview}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Enviando...' : `Enviar ${sendVia === 'crm' ? 'vía CRM' : ''}`}
        </button>

        {/* Result Message */}
        {result && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              result.ok
                ? 'bg-green-900/30 text-green-300 border border-green-700'
                : 'bg-red-900/30 text-red-300 border border-red-700'
            }`}
          >
            <div className="font-medium mb-1">{result.msg}</div>
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

export default SendPanel
