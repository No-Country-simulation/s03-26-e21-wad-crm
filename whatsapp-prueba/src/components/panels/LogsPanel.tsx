/**
 * LogsPanel - TypeScript Version
 * 
 * Activity logs viewer
 * Features:
 * - Real-time log display
 * - Auto-refresh polling
 * - Filter by log type
 * - Local and backend log integration
 */

import { useState, useCallback } from 'react'
import { Activity, RotateCw, Trash2 } from 'lucide-react'
import { CRMConfig } from '@/utils/storage'
import { formatTime } from '@/utils/helpers'
import { usePolling } from '@/hooks'

// ─── Types ────────────────────────────────────────────────────────────────────

const LOG_TYPES = {
  API: 'api',
  WEBHOOK: 'webhook',
  LOCK: 'lock',
  ERROR: 'error',
  SUCCESS: 'success',
  WARN: 'warn',
  INFO: 'info',
} as const

type LogType = typeof LOG_TYPES[keyof typeof LOG_TYPES]

interface Log {
  time: string
  type: 'error' | 'success' | 'warn' | 'info'
  msg: string
  category: LogType
  data?: any
}

interface LogsPanelProps {
  crmConfig?: CRMConfig | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LogsPanel({ crmConfig }: LogsPanelProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | LogType>('all')

  // ─── Fetch logs callback ──────────────────────────────────────────────────

  const fetchLogs = useCallback(async () => {
    if (!crmConfig?.token) {
      addLog('warn', '⚠️ Configurá el CRM primero (tab CRM) para ver logs del backend', LOG_TYPES.WARN)
      return
    }

    try {
      const apiBase =
        typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:8080'
          : crmConfig.baseUrl || ''

      const res = await fetch(`${apiBase}/api/conversations?page=0&size=10`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const convs = data.content || []

      const msg =
        convs.length === 0
          ? '📋 Conversaciones: 0'
          : `📋 Conversaciones: ${convs.length} total — Última: ${convs[0].contactName || convs[0].contactPhone || 'N/A'} (${convs[0].channel})`

      addLog(
        'info',
        msg,
        LOG_TYPES.API,
        convs.length > 0 ? { lastConversation: convs[0] } : undefined
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      addLog('error', `❌ Error: ${msg}`, LOG_TYPES.ERROR)
    }
  }, [crmConfig?.token, crmConfig?.baseUrl])

  // ─── usePolling hook ─────────────────────────────────────────────────────

  const { isPolling, pause, resume, triggerPoll, lastError, retryCount } = usePolling(
    fetchLogs,
    {
      interval: 5000,
      maxRetries: 3,
      enabled: false, // Start disabled, user toggles it
      onError: (error, attempt) => {
        addLog('error', `⚠️ Polling attempt ${attempt}: ${error.message}`, LOG_TYPES.ERROR)
      },
    }
  )

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleToggleAutoRefresh = useCallback(() => {
    if (isPolling) {
      pause()
    } else {
      resume()
    }
  }, [isPolling, pause, resume])

  function addLog(
    type: 'error' | 'success' | 'warn' | 'info',
    msg: string,
    category: LogType,
    data?: any
  ) {
    setLogs((prev) =>
      [{ time: new Date().toISOString(), type, msg, category, data }, ...prev].slice(0, 200)
    )
  }

  // ─── Derived ──────────────────────────────────────────────────────────────

  const filteredLogs = selectedFilter === 'all' ? logs : logs.filter((log) => log.category === selectedFilter)

  const logCounts: Record<'all' | LogType, number> = {
    all: logs.length,
    [LOG_TYPES.API]: logs.filter((l) => l.category === LOG_TYPES.API).length,
    [LOG_TYPES.WEBHOOK]: logs.filter((l) => l.category === LOG_TYPES.WEBHOOK).length,
    [LOG_TYPES.LOCK]: logs.filter((l) => l.category === LOG_TYPES.LOCK).length,
    [LOG_TYPES.ERROR]: logs.filter((l) => l.type === 'error').length,
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" /> Logs
            {isPolling && <span className="ml-2 text-xs text-green-400 font-bold">● POLLING</span>}
            {lastError && <span className="ml-2 text-xs text-red-400">({retryCount} retries)</span>}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => triggerPoll()}
              disabled={isPolling}
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-50 transition-colors font-medium flex items-center gap-1"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
              {isPolling ? 'Polling...' : 'Refresh'}
            </button>
            <button
              onClick={handleToggleAutoRefresh}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors font-medium flex items-center gap-1 ${
                isPolling
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Auto {isPolling ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition-colors font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 pb-3 border-b border-slate-700 overflow-x-auto">
          {['all', LOG_TYPES.API, LOG_TYPES.WEBHOOK, LOG_TYPES.LOCK, LOG_TYPES.ERROR].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter as any)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap font-medium transition-colors ${
                selectedFilter === filter
                  ? filter === LOG_TYPES.ERROR
                    ? 'bg-red-600/30 text-red-300 border border-red-500/50'
                    : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
              }`}
            >
              {filter.toUpperCase()}{' '}
              {logCounts[filter as any] > 0 && (
                <span className="ml-1 text-xs bg-slate-950 px-2 py-0.5 rounded">
                  {logCounts[filter as any]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Warning */}
        {!crmConfig?.token && (
          <div className="mb-4 p-3 rounded-lg bg-amber-900/20 text-amber-300 border border-amber-800/50 text-sm font-medium">
            ⚠️ Necesitás configurar el CRM en la tab <strong>CRM</strong> para ver logs del backend.
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.length === 0 && (
            <p className="text-slate-500 text-center py-8 text-sm">
              {logs.length === 0
                ? 'Sin logs aún. Enviá un mensaje o hacé refresh.'
                : `Sin logs de tipo ${selectedFilter}`}
            </p>
          )}
          {filteredLogs.map((log, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm border ${
                log.type === 'error'
                  ? 'bg-red-900/20 border-red-800/50 text-red-300'
                  : log.type === 'success'
                    ? 'bg-green-900/20 border-green-800/50 text-green-300'
                    : log.type === 'warn'
                      ? 'bg-amber-900/20 border-amber-800/50 text-amber-300'
                      : 'bg-slate-900/50 border-slate-700/50 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs text-slate-500 font-mono">{formatTime(log.time)}</span>
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-950/50">
                  {log.type}
                </span>
                <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">
                  {log.category}
                </span>
              </div>
              <div>{log.msg}</div>
              {log.data && (
                <pre className="mt-2 text-xs bg-slate-950/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LogsPanel
