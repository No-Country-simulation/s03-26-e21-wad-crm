/**
 * ConfigPanel - TypeScript Version
 * 
 * WhatsApp API configuration management
 * Features:
 * - Form management with type-safe inputs
 * - Connection testing to Meta Graph API
 * - Save to localStorage and CRM backend
 * - Full error handling
 */

import { useState, useCallback } from 'react'
import { Settings, Trash2 } from 'lucide-react'
import { WhatsAppConfig, CRMConfig } from '@/utils/storage'
import { WHATSAPP_CONFIG_FIELDS } from '@/utils/constants'
import { useLocalStorage } from '@/hooks'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigPanelProps {
  config?: WhatsAppConfig | null
  crmConfig?: CRMConfig | null
  onSave?: (config: WhatsAppConfig) => void
  onClear?: () => void
}

interface TestResult {
  ok: boolean
  msg: string
}

interface CrmSaveResult {
  ok: boolean
  msg: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfigPanel({
  config,
  crmConfig,
  onSave,
  onClear,
}: ConfigPanelProps) {
  const defaultConfig: WhatsAppConfig = {
    baseUrl: 'https://graph.facebook.com/v22.0',
    phoneNumberId: '',
    accessToken: '',
    appSecret: '',
    webhookVerifyToken: '',
    wabaId: '',
  }

  // Use localStorage hook instead of useState
  const [storedConfig, setStoredConfig] = useLocalStorage<WhatsAppConfig>(
    'wa-config',
    { defaultValue: config || defaultConfig, sync: true }
  )

  const form = storedConfig || defaultConfig

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [savingToCrm, setSavingToCrm] = useState(false)
  const [crmSaveResult, setCrmSaveResult] = useState<CrmSaveResult | null>(null)

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (field: keyof WhatsAppConfig, value: string) => {
      setStoredConfig({ ...form, [field]: value })
    },
    [form, setStoredConfig]
  )

  const testConnection = useCallback(async () => {
    if (!form.phoneNumberId || !form.accessToken) {
      setTestResult({ ok: false, msg: 'Completá phoneNumberId y accessToken' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const res = await fetch(`${form.baseUrl}/${form.phoneNumberId}`, {
        headers: { Authorization: `Bearer ${form.accessToken}` },
      })

      if (!res.ok) {
        const data = await res.json()
        const msg = data.error?.message || `HTTP ${res.status}`
        setTestResult({ ok: false, msg })
        return
      }

      const data = await res.json()
      const displayPhone = data.display_phone_number || form.phoneNumberId
      setTestResult({ ok: true, msg: `✅ Conectado — ${displayPhone}` })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setTestResult({ ok: false, msg })
    } finally {
      setTesting(false)
    }
  }, [form.baseUrl, form.phoneNumberId, form.accessToken])

  const saveToCrmBackend = useCallback(async () => {
    if (!crmConfig?.token) {
      setCrmSaveResult({
        ok: false,
        msg: '⚠️ Necesitás estar logueado en CRM para guardar',
      })
      return
    }

    if (!form.phoneNumberId || !form.accessToken || !form.appSecret || !form.webhookVerifyToken) {
      setCrmSaveResult({
        ok: false,
        msg: 'Completá: phoneNumberId, accessToken, appSecret, webhookVerifyToken',
      })
      return
    }

    setSavingToCrm(true)
    setCrmSaveResult(null)

    try {
      const apiBase =
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:8080'
          : crmConfig.baseUrl || ''

      const res = await fetch(`${apiBase}/api/settings/integrations/whatsapp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${crmConfig.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: form.phoneNumberId,
          accessToken: form.accessToken,
          appSecret: form.appSecret,
          webhookVerifyToken: form.webhookVerifyToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        const msg = data.message || data.error || `HTTP ${res.status}`
        setCrmSaveResult({ ok: false, msg: `❌ Error: ${msg}` })
        return
      }

      setCrmSaveResult({ ok: true, msg: '✅ Guardado en el CRM Backend!' })
      onSave?.(form)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setCrmSaveResult({ ok: false, msg: `❌ Error: ${msg}` })
    } finally {
      setSavingToCrm(false)
    }
  }, [form, crmConfig, onSave])

  const handleSave = useCallback(() => {
    onSave?.(form)
  }, [form, onSave])

  const handleClear = useCallback(() => {
    setStoredConfig(defaultConfig)
    setTestResult(null)
    setCrmSaveResult(null)
    onClear?.()
  }, [defaultConfig, setStoredConfig, onClear])

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-400" />
          Configuración de WhatsApp
        </h2>

        {/* Form Fields */}
        <div className="grid gap-4 mb-6">
          {WHATSAPP_CONFIG_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                value={form[field.key as keyof WhatsAppConfig] || ''}
                onChange={(e) => handleChange(field.key as keyof WhatsAppConfig, e.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={testConnection}
            disabled={testing}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            {testing ? 'Probando...' : '🔌 Probar Conexión'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium text-sm"
          >
            💾 Guardar en Local
          </button>
          <button
            onClick={saveToCrmBackend}
            disabled={savingToCrm || !crmConfig?.token}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            {savingToCrm ? 'Guardando...' : '🔐 Guardar en CRM'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            title="Limpiar configuración"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              testResult.ok
                ? 'bg-green-900/30 text-green-300 border border-green-700'
                : 'bg-red-900/30 text-red-300 border border-red-700'
            }`}
          >
            {testResult.msg}
          </div>
        )}

        {/* CRM Save Result */}
        {crmSaveResult && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              crmSaveResult.ok
                ? 'bg-green-900/30 text-green-300 border border-green-700'
                : 'bg-red-900/30 text-red-300 border border-red-700'
            }`}
          >
            {crmSaveResult.msg}
          </div>
        )}

        {/* Not Logged In Warning */}
        {!crmConfig?.token && (
          <div className="p-3 rounded-lg text-sm bg-yellow-900/30 text-yellow-300 border border-yellow-700 font-medium">
            ⚠️ Necesitás estar logueado en CRM para guardar en el backend
          </div>
        )}
      </div>
    </div>
  )
}

export default ConfigPanel
