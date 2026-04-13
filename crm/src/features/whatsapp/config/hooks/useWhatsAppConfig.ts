import { useState, useCallback } from 'react'
import type { WhatsAppConfig, WhatsAppStatus, WhatsAppConfigResponse, TestResult } from '../types'
import { DEFAULT_WHATSAPP_CONFIG, WHATSAPP_API_BASE } from '../constants'

const API_BASE = '/api/settings/integrations'

export function useWhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig>(DEFAULT_WHATSAPP_CONFIG)
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}`)
      if (!response.ok) throw new Error('Error al obtener estado')
      const data = await response.json()
      setStatus(data.whatsapp)
      
      if (data.whatsapp?.phoneNumberId) {
        setConfig(prev => ({
          ...prev,
          phoneNumberId: data.whatsapp.phoneNumberId,
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const testConnection = useCallback(async (): Promise<TestResult> => {
    if (!config.phoneNumberId || !config.accessToken) {
      const result = { ok: false, msg: 'Completá Phone Number ID y Access Token' }
      setTestResult(result)
      return result
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const baseUrl = config.baseUrl || WHATSAPP_API_BASE
      const response = await fetch(`${baseUrl}/${config.phoneNumberId}`, {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      })

      if (!response.ok) {
        const data = await response.json()
        const msg = data.error?.message || `HTTP ${response.status}`
        const result = { ok: false, msg }
        setTestResult(result)
        return result
      }

      const data = await response.json()
      const displayPhone = data.display_phone_number || config.phoneNumberId
      const result = { ok: true, msg: `Conectado - ${displayPhone}` }
      setTestResult(result)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      const result = { ok: false, msg }
      setTestResult(result)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [config])

  const saveConfig = useCallback(async (newConfig?: Partial<WhatsAppConfig>): Promise<WhatsAppConfigResponse> => {
    const configToSave = newConfig ? { ...config, ...newConfig } : config
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al guardar configuración')
      }

      const data = await response.json()
      setStatus(data)
      setConfig(configToSave)
      return { success: true, status: data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [config])

  const disconnect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/whatsapp`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al desconectar')

      setStatus(null)
      setConfig(DEFAULT_WHATSAPP_CONFIG)
      setTestResult(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateConfig = useCallback((updates: Partial<WhatsAppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    setTestResult(null)
  }, [])

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_WHATSAPP_CONFIG)
    setTestResult(null)
    setError(null)
  }, [])

  return {
    config,
    status,
    isLoading,
    error,
    testResult,
    fetchStatus,
    testConnection,
    saveConfig,
    disconnect,
    updateConfig,
    resetConfig,
  }
}