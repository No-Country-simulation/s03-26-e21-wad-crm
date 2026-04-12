import { useState, useEffect, useCallback, useRef } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { useWhatsAppApi } from '@/hooks/useWhatsAppApi'
import type { Conversation, Message, ContactInfo, LockStatus } from '../types'

interface UseConversationsPanelProps {
  config?: {
    token?: string
    baseUrl?: string
  }
  crmConfig?: {
    token?: string
    baseUrl?: string
    userId?: string
  }
}

export function useConversationsPanel({ config, crmConfig }: UseConversationsPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [contacts, setContacts] = useState<Record<string, ContactInfo>>({})
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showContactPanel, setShowContactPanel] = useState(false)
  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const api = useWhatsAppApi({ config, crmConfig, retries: 2 })

  const loadCrmContactsData = useCallback(async () => {
    if (!crmConfig?.token || !crmConfig?.baseUrl) return

    try {
      const res = await fetch(`${crmConfig.baseUrl}/api/contacts?page=0&size=200`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const map: Record<string, ContactInfo> = {}
      ;(data.content || []).forEach((c: ContactInfo) => {
        map[c.id] = c
      })
      setContacts(map)
    } catch (err) {
      console.error('Error loading contacts:', err)
    }
  }, [crmConfig?.token, crmConfig?.baseUrl])

  const fetchConversations = useCallback(async () => {
    if (!crmConfig?.token || !crmConfig?.baseUrl) {
      setError('Sesión expirada. Cerrá sesión y volvé a iniciar.')
      return
    }

    setError(null)

    try {
      const res = await fetch(`${crmConfig.baseUrl}/api/conversations?page=0&size=50`, {
        headers: { Authorization: `Bearer ${crmConfig.token}` },
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Sesión expirada. Cerrá sesión y volvé a iniciar.')
        } else {
          const data = await res.json()
          setError(data.message || `Error ${res.status}`)
        }
        return
      }

      const data = await res.json()
      setConversations(data.content || [])
    } catch (err) {
      setError((err as Error).message)
    }
  }, [crmConfig?.token, crmConfig?.baseUrl])

  const fetchMessages = useCallback(
    async (convId: string) => {
      if (!crmConfig?.token || !crmConfig?.baseUrl) return

      try {
        const res = await fetch(
          `${crmConfig.baseUrl}/api/conversations/${convId}/messages?page=0&size=200`,
          {
            headers: { Authorization: `Bearer ${crmConfig.token}` },
          }
        )

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        setMessages(data.content || [])
        setSelectedConv(convId)
        fetchAttendingStatus(convId)
      } catch (err) {
        setError((err as Error).message)
      }
    },
    [crmConfig?.token, crmConfig?.baseUrl]
  )

  const fetchAttendingStatus = useCallback(
    async (convId: string) => {
      if (!crmConfig?.token || !crmConfig?.baseUrl || !convId) return

      try {
        const res = await fetch(
          `${crmConfig.baseUrl}/api/whatsapp/conversations/${convId}/attending`,
          {
            headers: { Authorization: `Bearer ${crmConfig.token}` },
          }
        )

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        setLockStatus(data)
      } catch (err) {
        console.error('Error fetching attending status:', err)
      }
    },
    [crmConfig?.token, crmConfig?.baseUrl]
  )

  const startAttending = useCallback(async () => {
    if (!selectedConv || !crmConfig?.token || !crmConfig?.baseUrl) return

    try {
      const res = await fetch(
        `${crmConfig.baseUrl}/api/whatsapp/conversations/${selectedConv}/start`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${crmConfig.token}` },
        }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (data.started) {
        fetchAttendingStatus(selectedConv)
      }
    } catch (err) {
      console.error('Error starting attending:', err)
    }
  }, [selectedConv, crmConfig?.token, crmConfig?.baseUrl, fetchAttendingStatus])

  const stopAttending = useCallback(async () => {
    if (!selectedConv || !crmConfig?.token || !crmConfig?.baseUrl) return

    try {
      const res = await fetch(
        `${crmConfig.baseUrl}/api/whatsapp/conversations/${selectedConv}/stop`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${crmConfig.token}` },
        }
      )

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      setLockStatus({ isAttending: false })
    } catch (err) {
      console.error('Error stopping attending:', err)
    }
  }, [selectedConv, crmConfig?.token, crmConfig?.baseUrl])

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConv) return

    if (!crmConfig?.token || !crmConfig?.baseUrl) {
      setError('No estás autenticado. Cerrá sesión y volvé a iniciar.')
      return
    }

    try {
      const res = await fetch(
        `${crmConfig.baseUrl}/api/conversations/${selectedConv}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${crmConfig.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ body: newMessage }),
        }
      )

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError('Sesión expirada. Cerrá sesión y volvé a iniciar.')
        } else {
          throw new Error(`HTTP ${res.status}`)
        }
        return
      }

      setNewMessage('')
      fetchMessages(selectedConv)
      fetchConversations()
    } catch (err) {
      setError((err as Error).message)
    }
  }, [newMessage, selectedConv, crmConfig?.token, crmConfig?.baseUrl, fetchMessages, fetchConversations])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  useEffect(() => {
    if (!crmConfig?.token) return
    loadCrmContactsData()
  }, [crmConfig?.token, loadCrmContactsData])

  useEffect(() => {
    if (crmConfig?.token) {
      fetchConversations()
    }
  }, [crmConfig?.token, fetchConversations])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  usePolling(
    async () => {
      if (!selectedConv) return
      await fetchConversations()
      await fetchMessages(selectedConv)
      await fetchAttendingStatus(selectedConv)
    },
    {
      interval: 10_000,
      enabled: !!(selectedConv && crmConfig?.token),
    }
  )

  function getContactInfo(contactId: string): ContactInfo {
    const c = contacts[contactId]
    if (!c) return { id: contactId, name: 'Contacto', phone: '', email: '' }
    return c
  }

  function formatMsgTime(dateStr: string): string {
    if (!dateStr) return ''

    try {
      const d = new Date(dateStr.replace(' ', 'T'))
      if (isNaN(d.getTime())) return dateStr

      const now = new Date()
      const isToday = d.toDateString() === now.toDateString()

      if (isToday) {
        return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
      }

      return (
        d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) +
        ' ' +
        d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
      )
    } catch {
      return dateStr
    }
  }

  function getMessageStatusIcon(status?: string): string {
    switch (status) {
      case 'SENT':
        return '✓'
      case 'DELIVERED':
        return '✓✓'
      case 'READ':
        return '✓✓'
      case 'FAILED':
        return '✗'
      default:
        return '◷'
    }
  }

  const selectedConvData = conversations.find(c => c.id === selectedConv)
  const selectedContactInfo = selectedConvData
    ? getContactInfo(selectedConvData.contactId)
    : null

  return {
    conversations,
    messages,
    selectedConv,
    contacts,
    selectedContact,
    error,
    newMessage,
    showContactPanel,
    lockStatus,
    messagesEndRef,
    isLoadingConversations: api.loading,
    selectedConvData,
    selectedContactInfo,
    setNewMessage,
    setSelectedContact,
    setShowContactPanel,
    fetchConversations,
    fetchMessages,
    startAttending,
    stopAttending,
    sendMessage,
    handleKeyPress,
    getContactInfo,
    formatMsgTime,
    getMessageStatusIcon,
  }
}
