/**
 * ConversationsPanel - Refactored with usePolling + useWhatsAppApi
 *
 * Displays WhatsApp conversations with real-time messaging
 * Features:
 * - Conversation list with contact info
 * - Message history with auto-scroll
 * - Attending status (multi-agent lock)
 * - Auto-polling every 10 seconds (via usePolling hook)
 * - Contact info panel integration
 * - Automatic retry logic (via useWhatsAppApi hook)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { MessageCircle, Activity } from 'lucide-react'
import { formatTime } from '@/utils/helpers'
import { ContactInfoPanel } from './ContactInfoPanel'
import { usePolling } from '@/hooks/usePolling'
import { useWhatsAppApi } from '@/hooks/useWhatsAppApi'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  body: string
  direction: 'INBOUND' | 'OUTBOUND'
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'PENDING'
  sentAt: string
}

export interface Conversation {
  id: string
  contactId: string
  channel: 'WHATSAPP' | 'EMAIL'
  lastMessageAt?: string
  messageCount?: number
}

export interface ContactInfo {
  id: string
  name: string
  email?: string
  phone?: string
}

export interface LockStatus {
  isAttending: boolean
  agentId?: string
  agentName?: string
}

interface ConversationsPanelProps {
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

// ─── Logging Constants ────────────────────────────────────────────────────────

const LOG_TYPES = {
  API: 'api',
  WEBHOOK: 'webhook',
  LOCK: 'lock',
  ERROR: 'error',
  SUCCESS: 'success',
  WARN: 'warn',
  INFO: 'info',
} as const

// ─── Component ────────────────────────────────────────────────────────────────

export function ConversationsPanel({ config, crmConfig }: ConversationsPanelProps) {
  // ──────────────────────────────────────────────────────────────────────────
  // State: Conversations & Messages
  // ──────────────────────────────────────────────────────────────────────────

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConv, setSelectedConv] = useState<string | null>(null)

  // ──────────────────────────────────────────────────────────────────────────
  // State: Contacts
  // ──────────────────────────────────────────────────────────────────────────

  const [contacts, setContacts] = useState<Record<string, ContactInfo>>({})
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null)

  // ──────────────────────────────────────────────────────────────────────────
  // State: UI
  // ──────────────────────────────────────────────────────────────────────────

  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showContactPanel, setShowContactPanel] = useState(false)

  // ──────────────────────────────────────────────────────────────────────────
  // State: Conversation control
  // ──────────────────────────────────────────────────────────────────────────

  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null)

  // ──────────────────────────────────────────────────────────────────────────
  // Refs
  // ──────────────────────────────────────────────────────────────────────────

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ──────────────────────────────────────────────────────────────────────────
  // Hooks: API wrapper with retry logic
  // ──────────────────────────────────────────────────────────────────────────

  const api = useWhatsAppApi({ config, crmConfig, retries: 2 })

  // ──────────────────────────────────────────────────────────────────────────
  // Callback: Load CRM contacts (initial load only)
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Callback: Fetch conversations (used by polling)
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Callback: Fetch messages for a conversation
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Callback: Fetch attending status
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Callback: Start attending conversation
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Callback: Stop attending conversation
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Callback: Send message (uses useWhatsAppApi)
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Effect: Load contacts on mount
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!crmConfig?.token) return
    loadCrmContactsData()
  }, [crmConfig?.token, loadCrmContactsData])

  // ──────────────────────────────────────────────────────────────────────────
  // Effect: Initial fetch conversations
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (crmConfig?.token) {
      fetchConversations()
    }
  }, [crmConfig?.token, fetchConversations])

  // ──────────────────────────────────────────────────────────────────────────
  // Effect: Auto-scroll to bottom when messages update
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // ──────────────────────────────────────────────────────────────────────────
  // Hook: Setup polling when conversation is selected
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ──────────────────────────────────────────────────────────────────────────

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage]
  )

  // ──────────────────────────────────────────────────────────────────────────
  // Utilities
  // ──────────────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────────────
  // Computed
  // ──────────────────────────────────────────────────────────────────────────

  const selectedConvData = conversations.find(c => c.id === selectedConv)
  const selectedContactInfo = selectedConvData
    ? getContactInfo(selectedConvData.contactId)
    : null

  const isLoadingConversations = api.loading

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden"
      style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
    >
      <div className="flex h-full">
        {/* ── Left Sidebar: Conversations List ── */}
        <div className="w-80 border-r border-slate-700 bg-slate-900/50 flex flex-col">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              Conversaciones
            </h2>
            <button
              onClick={() => fetchConversations()}
              disabled={isLoadingConversations}
              className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              {isLoadingConversations ? '...' : '↻'}
            </button>
          </div>

          {error && (
            <div className="mx-3 mt-3 p-2 rounded bg-red-900/30 text-red-300 text-xs border border-red-700">
              ❌ {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && !isLoadingConversations && (
              <div className="flex items-center justify-center py-8">
                <span className="text-slate-500 text-sm">Sin conversaciones</span>
              </div>
            )}

            {conversations.map(conv => {
              const info = getContactInfo(conv.contactId)
              const isSelected = selectedConv === conv.id

              return (
                <button
                  key={conv.id}
                  onClick={() => fetchMessages(conv.id)}
                  className={`w-full text-left p-3 border-b border-slate-800 transition-colors ${
                    isSelected
                      ? 'bg-green-900/20 border-l-2 border-l-green-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        conv.channel === 'WHATSAPP'
                          ? 'bg-green-700 text-white'
                          : 'bg-blue-700 text-white'
                      }`}
                    >
                      {info.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">
                          {info.name}
                        </span>
                        <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                          {conv.lastMessageAt ? formatMsgTime(conv.lastMessageAt) : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-slate-400 truncate">
                          {info.phone || info.email || 'Sin datos'}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${
                            conv.channel === 'WHATSAPP'
                              ? 'bg-green-900/40 text-green-400'
                              : 'bg-blue-900/40 text-blue-400'
                          }`}
                        >
                          {conv.channel === 'WHATSAPP' ? 'WA' : 'EM'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right Panel: Messages ── */}
        <div className="flex-1 flex flex-col bg-slate-900/30">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">Seleccioná una conversación</p>
                <p className="text-slate-600 text-sm mt-1">Elegí un contacto de la lista izquierda</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-3 justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
                    onClick={() => {
                      setSelectedContact(
                        selectedConvData?.contactId
                          ? contacts[selectedConvData.contactId]
                          : null
                      )
                      setShowContactPanel(true)
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedConvData?.channel === 'WHATSAPP'
                          ? 'bg-green-700 text-white'
                          : 'bg-blue-700 text-white'
                      }`}
                    >
                      {selectedContactInfo?.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selectedContactInfo?.name || 'Contacto'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {selectedContactInfo?.phone ||
                          selectedContactInfo?.email ||
                          ''}
                      </p>
                    </div>
                  </div>

                  {/* Botón Iniciar/Cerrar */}
                  {!lockStatus?.isAttending ? (
                    <button
                      onClick={startAttending}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
                    >
                      🟢 Iniciar
                    </button>
                  ) : lockStatus?.agentId === crmConfig?.userId ? (
                    <button
                      onClick={stopAttending}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600/40 text-red-300 border border-red-600/50 hover:bg-red-600/50 transition-colors"
                    >
                      🔴 Cerrar
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Banner - solo mostrar si está siendo atendida por OTRO agente */}
              {lockStatus?.isAttending && lockStatus?.agentId !== crmConfig?.userId && (
                <div className="bg-yellow-900/40 border-b border-yellow-700 p-4 flex items-center gap-2 text-yellow-300 text-sm">
                  <Activity className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">🔒 Atendiendo: {lockStatus.agentName}</span>
                  <span className="text-xs text-yellow-400 ml-auto">Solo lectura</span>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 text-sm">
                      Sin mensajes en esta conversación
                    </p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          msg.direction === 'OUTBOUND'
                            ? 'bg-green-700 text-white rounded-br-md'
                            : 'bg-slate-700 text-white rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>

                        <div
                          className={`flex items-center justify-end gap-2 mt-1 ${
                            msg.direction === 'OUTBOUND'
                              ? 'text-green-200'
                              : 'text-slate-400'
                          }`}
                        >
                          <span className="text-xs">{formatMsgTime(msg.sentAt)}</span>

                          {msg.status && msg.direction === 'OUTBOUND' && (
                            <span className="text-xs">
                              {getMessageStatusIcon(msg.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Solo mostrar si YO estoy atendiendo */}
              {lockStatus?.isAttending && lockStatus?.agentId === crmConfig?.userId ? (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Escribí un mensaje..."
                      rows={1}
                      className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none min-h-[40px] max-h-[120px]"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={api.loading || !newMessage.trim() || !selectedConv}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {api.loading ? '◷' : '→'}
                    </button>
                  </div>
                </div>
              ) : !lockStatus?.isAttending ? (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <div className="p-3 rounded-lg bg-slate-700/50 text-slate-400 text-sm text-center border border-slate-600">
                    📖 Solo lectura - Hacé clic en <strong>"Iniciar"</strong> para
                    atender esta conversación
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                  <div className="p-3 rounded-lg bg-yellow-900/20 text-yellow-300 text-sm text-center border border-yellow-700">
                    🔒 Atendido por: <strong>{lockStatus?.agentName}</strong>
                    <br />
                    <span className="text-xs">Esperá a que cierre la atención</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ContactInfoPanel - Opens on contact name click */}
      <ContactInfoPanel
        isOpen={showContactPanel}
        onClose={() => setShowContactPanel(false)}
        contact={selectedContact}
      />
    </div>
  )
}

export default ConversationsPanel
