/**
 * WebhookSimulator - TypeScript Version
 * 
 * Test WhatsApp webhook signatures and payloads
 */

import { useState } from 'react'
import { Webhook } from 'lucide-react'
import { BACKEND_BASE } from '@/utils/constants'

interface WebhookSimulatorProps {
  config?: {
    appSecret?: string
  }
}

interface Result {
  ok: boolean
  msg: string
}

const WEBHOOK_TEMPLATES = [
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
              id: 'wamid.test-message-id',
              status: 'delivered',
              timestamp: String(Math.floor(Date.now() / 1000)),
              recipient_id: '14155551234',
              conversation: { id: 'conv-123', origin: { type: 'utility' } },
              pricing: { billable: true, pricing_model: 'CBP', category: 'utility' },
            }],
          },
          field: 'message_status',
        }],
      }],
    },
  },
]

export function WebhookSimulator({ config }: WebhookSimulatorProps) {
  const [payload, setPayload] = useState(
    JSON.stringify(WEBHOOK_TEMPLATES[0].payload, null, 2)
  )
  const [result, setResult] = useState<Result | null>(null)
  const [sending, setSending] = useState(false)

  async function simulateWebhook() {
    if (!config?.appSecret) {
      setResult({
        ok: false,
        msg: 'Necesitás configurar el App Secret para calcular la firma',
      })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(config.appSecret)
      const messageData = encoder.encode(payload)
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
      const hexSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      const res = await fetch(`${BACKEND_BASE}/webhooks/whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': `sha256=${hexSignature}`,
        },
        body: payload,
      })

      if (res.ok) {
        setResult({ ok: true, msg: `Webhook enviado — Status: ${res.status}` })
      } else {
        setResult({
          ok: false,
          msg: `Error — Status: ${res.status} ${res.statusText}`,
        })
      }
    } catch (err) {
      setResult({ ok: false, msg: (err as Error).message })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Webhook className="w-5 h-5 text-blue-400" />
          Webhook Simulator
        </h2>

        {/* Templates */}
        <div className="mb-4 space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Plantillas
          </label>
          <div className="flex gap-2 flex-wrap">
            {WEBHOOK_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                onClick={() =>
                  setPayload(JSON.stringify(tpl.payload, null, 2))
                }
                className="px-3 py-1.5 rounded-lg text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* JSON Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Payload JSON
          </label>
          <textarea
            value={payload}
            onChange={e => setPayload(e.target.value)}
            className="w-full h-64 rounded-lg border border-slate-600 bg-slate-900 text-white p-3 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={simulateWebhook}
          disabled={sending}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors font-medium"
        >
          {sending ? 'Enviando...' : 'Enviar Webhook'}
        </button>

        {/* Result */}
        {result && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              result.ok
                ? 'bg-green-900/30 text-green-300 border border-green-700'
                : 'bg-red-900/30 text-red-300 border border-red-700'
            }`}
          >
            {result.ok ? '✅' : '❌'} {result.msg}
          </div>
        )}
      </div>
    </div>
  )
}

export default WebhookSimulator
