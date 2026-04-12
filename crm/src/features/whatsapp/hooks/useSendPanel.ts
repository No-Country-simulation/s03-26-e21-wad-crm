import { useState, useEffect, useCallback } from 'react'
import { useWhatsAppApi } from '@/hooks/useWhatsAppApi'
import { countVariables } from '@/utils/helpers'

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

interface UseSendPanelProps {
  config?: any
  templates?: any[]
  crmConfig?: any
}

export function useSendPanel({ config, templates = [], crmConfig }: UseSendPanelProps) {
  const [phone, setPhone] = useState('')
  const [body, setBody] = useState('')
  const [contactId, setContactId] = useState('')
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [mode, setMode] = useState<SendMode>('text')
  const [sendVia, setSendVia] = useState<SendVia>('direct')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateParams, setTemplateParams] = useState('')
  const [result, setResult] = useState<SendResult | null>(null)

  const api = useWhatsAppApi({ config, crmConfig, retries: 2 })

  const selectedTpl = templates.find((t) => t.id === selectedTemplateId)
  const apiBase =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : crmConfig?.baseUrl || ''

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

  const handleSendViaCrm = useCallback(async () => {
    setResult(null)

    try {
      const payload: any = {
        recipient: contactId,
        message: body || `[Template: ${selectedTpl?.name || 'N/A'}]`,
      }

      if (mode === 'template' && selectedTpl) {
        payload.templateId = selectedTpl.id
        payload.type = 'template'
      }

      const result = await api.sendViaCRM(payload)

      if (!result) {
        setResult({ ok: false, msg: `❌ CRM Error: ${api.error || 'Error desconocido'}` })
        return
      }

      setResult({
        ok: true,
        msg: `✅ CRM: Enviado! messageId=${result.messageId || 'N/A'}`,
        data: result,
      })
      setBody('')
      setTemplateParams('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setResult({ ok: false, msg: `❌ CRM Error: ${msg}` })
    }
  }, [api, contactId, body, selectedTpl, mode])

  const handleSend = useCallback(async () => {
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

    if (!config?.phoneNumberId || !config?.accessToken) {
      setResult({ ok: false, msg: '❌ Configurá las credenciales primero (tab Configuración)' })
      return
    }
    if (!phone) {
      setResult({ ok: false, msg: '❌ Completá el teléfono destino' })
      return
    }

    setResult(null)

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '')
      let result: any = null

      if (mode === 'template') {
        if (!selectedTpl) {
          setResult({ ok: false, msg: '❌ Seleccioná un template guardado' })
          return
        }

        const bodyComp = selectedTpl.components.find((c) => c.type === 'body')
        const params = templateParams.split(',').map((p) => p.trim()).filter(Boolean)
        const varCount = countVariables(bodyComp?.text || '')

        result = await api.sendTemplateDirect(
          cleanPhone,
          selectedTpl.name,
          selectedTpl.language,
          params.slice(0, varCount)
        )
      } else {
        if (!body) {
          setResult({ ok: false, msg: '❌ Completá el mensaje' })
          return
        }

        result = await api.sendTextDirect(cleanPhone, body)
      }

      if (!result) {
        setResult({ ok: false, msg: `❌ Error: ${api.error || 'Error desconocido'}` })
        return
      }

      const externalId = result.messages?.[0]?.id
      setResult({ ok: true, msg: `✅ Enviado! ID: ${externalId || 'N/A'}`, data: result })
      setBody('')
      setTemplateParams('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setResult({ ok: false, msg: `❌ Error: ${msg}` })
    }
  }, [
    sendVia,
    crmConfig,
    config,
    phone,
    body,
    mode,
    selectedTpl,
    templateParams,
    api,
    contactId,
    handleSendViaCrm,
  ])

  useEffect(() => {
    if (sendVia === 'crm' && crmConfig?.token && crmContacts.length === 0) {
      loadCrmContacts()
    }
  }, [sendVia, crmConfig?.token, crmContacts.length, loadCrmContacts])

  return {
    phone,
    body,
    contactId,
    crmContacts,
    loadingContacts,
    mode,
    sendVia,
    selectedTemplateId,
    templateParams,
    result,
    selectedTpl,
    apiBase,
    isLoading: api.loading,
    setPhone,
    setBody,
    setContactId,
    setMode,
    setSendVia,
    setSelectedTemplateId,
    setTemplateParams,
    handleSend,
    loadCrmContacts,
  }
}
