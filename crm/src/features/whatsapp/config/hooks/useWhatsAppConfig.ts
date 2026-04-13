import { useState, useCallback } from 'react'
import type { WhatsAppConfig, WhatsAppStatus, WhatsAppConfigResponse } from '../types'

const API_BASE = '/api/settings/integrations'

export function useWhatsAppConfig() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}`)
      if (!response.ok) throw new Error('Error al obtener estado')
      const data = await response.json()
      setStatus(data.whatsapp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveConfig = useCallback(async (config: WhatsAppConfig): Promise<WhatsAppConfigResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al guardar configuración')
      }

      const data = await response.json()
      setStatus(data)
      return { success: true, status: data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/whatsapp`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al desconectar')

      setStatus(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    saveConfig,
    disconnect,
  }
}