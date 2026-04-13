import { useState, useCallback } from 'react'
import type { EmailConfig, EmailStatus, EmailConfigResponse } from '../types'

const API_BASE = '/api/settings/integrations'

export function useEmailConfig() {
  const [status, setStatus] = useState<EmailStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}`)
      if (!response.ok) throw new Error('Error al obtener estado')
      const data = await response.json()
      setStatus(data.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveSmtpConfig = useCallback(async (config: Omit<EmailConfig, 'type'>): Promise<EmailConfigResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SMTP', ...config }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al configurar SMTP')
      }

      const data = await response.json()
      setStatus({ connected: true, type: 'SMTP', identifier: config.host || null })
      return { success: true, type: 'SMTP', connected: true, host: config.host }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startGmailOAuth = useCallback(async (): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'GMAIL' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al iniciar OAuth')
      }

      const data = await response.json()
      return data.authUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/email`, {
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
    saveSmtpConfig,
    startGmailOAuth,
    disconnect,
  }
}