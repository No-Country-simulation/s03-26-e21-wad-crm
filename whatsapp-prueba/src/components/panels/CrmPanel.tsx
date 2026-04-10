/**
 * CrmPanel - TypeScript Version
 * 
 * CRM backend configuration management
 * Features:
 * - Base URL configuration
 * - JWT token management
 * - Connection testing to /api/auth/me
 * - Fallback health check on failure
 */

import { useState } from 'react'
import { Server, Trash2 } from 'lucide-react'
import { CRMConfig, saveCrmConfig } from '@/utils/storage'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TestResult {
  ok: boolean
  msg: string
}

interface CrmPanelProps {
  crmConfig?: CRMConfig | null
  onSave?: (config: CRMConfig) => void
  onClear?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CrmPanel({ crmConfig, onSave, onClear }: CrmPanelProps) {
  const [form, setForm] = useState<CRMConfig>(
    crmConfig || {
      baseUrl: 'http://localhost:8080',
      token: '',
      workspaceId: '',
    }
  )

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleChange(field: keyof CRMConfig, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
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
      const apiBase =
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? ''
          : form.baseUrl

      const res = await fetch(`${apiBase}/api/auth/me`, {
        headers: { Authorization: `Bearer ${form.token}` },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const displayName = data.email || data.name || 'OK'
      setTestResult({ ok: true, msg: `✅ Conectado — ${displayName}` })
    } catch (err) {
      // Try actuator health as fallback
      try {
        const apiBase =
          typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? ''
            : form.baseUrl

        const healthRes = await fetch(`${apiBase}/actuator/health`)
        if (!healthRes.ok) throw new Error(`HTTP ${healthRes.status}`)

        const healthData = await healthRes.json()
        setTestResult({
          ok: true,
          msg: `⚠️ Backend UP (${healthData.status}), pero /api/auth/me falló — verificá el token`,
        })
      } catch {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        setTestResult({ ok: false, msg })
      }
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    saveCrmConfig(form)
    onSave?.(form)
  }

  function handleClear() {
    const reset: CRMConfig = {
      baseUrl: 'http://localhost:8080',
      token: '',
      workspaceId: '',
    }
    setForm(reset)
    setTestResult(null)
    onClear?.()
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-green-400" />
          Configuración del CRM
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Configurá la conexión al backend del CRM para enviar mensajes y ver conversaciones.
        </p>

        {/* Form Fields */}
        <div className="grid gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Backend URL</label>
            <input
              type="text"
              value={form.baseUrl || ''}
              onChange={(e) => handleChange('baseUrl', e.target.value)}
              placeholder="http://localhost:8080"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">JWT Token</label>
            <input
              type="password"
              value={form.token || ''}
              onChange={(e) => handleChange('token', e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiJ9..."
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">Obtené el token haciendo login en el CRM</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Workspace ID (UUID)
            </label>
            <input
              type="text"
              value={form.workspaceId || ''}
              onChange={(e) => handleChange('workspaceId', e.target.value)}
              placeholder="46b432d9-1138-4e12-a262-c82ae17d3d21"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors font-mono text-sm"
            />
          </div>
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
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors font-medium text-sm"
          >
            💾 Guardar
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
            className={`p-3 rounded-lg text-sm font-medium ${
              testResult.ok
                ? 'bg-green-900/30 text-green-300 border border-green-700'
                : 'bg-red-900/30 text-red-300 border border-red-700'
            }`}
          >
            {testResult.msg}
          </div>
        )}
      </div>
    </div>
  )
}

export default CrmPanel
