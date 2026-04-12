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
  type?: 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker'
  mediaUrl?: string
  mimeType?: string
  caption?: string
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
  // Message Content Renderer
  // ──────────────────────────────────────────────────────────────────────────

  function MessageContent({ message }: { message: Message }) {
    const type = message.type || 'text'

    switch (type) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.mediaUrl && (
              <img
                src={message.mediaUrl}
                alt="Imagen"
                className="max-w-full max-h-96 rounded-lg cursor-pointer hover:opacity-90 transition"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            )}
            {message.caption && (
              <p className="whitespace-pre-wrap break-words text-sm">{message.caption}</p>
            )}
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-2">
            {message.mediaUrl && (
              <audio controls className="w-full max-w-xs">
                <source src={message.mediaUrl} type={message.mimeType || 'audio/ogg'} />
                Tu navegador no soporta audio.
              </audio>
            )}
            {message.caption && (
              <p className="whitespace-pre-wrap break-words text-sm">{message.caption}</p>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="space-y-2">
            {message.mediaUrl && (
              <video controls className="max-w-full max-h-96 rounded-lg">
                <source src={message.mediaUrl} type={message.mimeType || 'video/mp4'} />
                Tu navegador no soporta video.
              </video>
            )}
            {message.caption && (
              <p className="whitespace-pre-wrap break-words text-sm">{message.caption}</p>
            )}
          </div>
        )

      case 'document':
        return (
          <div className="space-y-2">
            <a
              href={message.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 underline"
            >
              📄 {message.body || 'Documento'}
            </a>
            {message.caption && (
              <p className="whitespace-pre-wrap break-words text-sm">{message.caption}</p>
            )}
          </div>
        )

      case 'sticker':
        return (
          <div>
            {message.mediaUrl && (
              <img
                src={message.mediaUrl}
                alt="Sticker"
                className="w-32 h-32 object-contain"
              />
            )}
          </div>
        )

      case 'text':
      default:
        return <p className="whitespace-pre-wrap break-words">{message.body}</p>
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
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}
    >
      <div className="flex h-full">
        {/* ── Left Sidebar: Conversations List ── */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              Conversaciones
            </h2>
            <button
              onClick={() => fetchConversations()}
              disabled={isLoadingConversations}
              className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 disabled:opacity-50 transition-colors"
            >
              {isLoadingConversations ? '...' : '↻'}
            </button>
          </div>

          {error && (
            <div className="mx-3 mt-3 p-2 rounded bg-destructive/20 text-destructive text-xs border border-destructive">
              ❌ {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && !isLoadingConversations && (
              <div className="flex items-center justify-center py-8">
                <span className="text-muted-foreground text-sm">Sin conversaciones</span>
              </div>
            )}

            {conversations.map(conv => {
              const info = getContactInfo(conv.contactId)
              const isSelected = selectedConv === conv.id

              return (
                <button
                  key={conv.id}
                  onClick={() => fetchMessages(conv.id)}
                  className={`w-full text-left p-3 border-b border-border transition-colors ${
                    isSelected
                      ? 'bg-green-600/20 border-l-2 border-l-green-600'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        conv.channel === 'WHATSAPP'
                          ? 'bg-green-600 text-white'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {info.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground truncate">
                          {info.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {conv.lastMessageAt ? formatMsgTime(conv.lastMessageAt) : ''}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">
                          {info.phone || info.email || 'Sin datos'}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${
                            conv.channel === 'WHATSAPP'
                              ? 'bg-green-600/20 text-green-600'
                              : 'bg-primary/20 text-primary'
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
        <div className="flex-1 flex flex-col bg-muted/30">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="size-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Seleccioná una conversación</p>
                <p className="text-muted-foreground text-sm mt-1">Elegí un contacto de la lista izquierda</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border bg-card">
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
                      className={`size-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedConvData?.channel === 'WHATSAPP'
                          ? 'bg-green-600 text-white'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {selectedContactInfo?.name?.charAt(0).toUpperCase() || '?'}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedContactInfo?.name || 'Contacto'}
                      </p>
                      <p className="text-xs text-muted-foreground">
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
                <div className="bg-warning/20 border-b border-warning p-4 flex items-center gap-2 text-warning text-sm">
                  <Activity className="size-5" />
                  <span className="font-medium">🔒 Atendiendo: {lockStatus.agentName}</span>
                  <span className="text-xs ml-auto">Solo lectura</span>
                </div>
              )}

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">
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
                            ? 'bg-green-600 text-white rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <MessageContent message={msg} />

                        <div
                          className={`flex items-center justify-end gap-2 mt-1 ${
                            msg.direction === 'OUTBOUND'
                              ? 'text-green-100'
                              : 'text-muted-foreground'
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
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Escribí un mensaje..."
                      rows={1}
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none min-h-[40px] max-h-[120px]"
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
                <div className="p-4 border-t border-border bg-card">
                  <div className="p-3 rounded-lg bg-muted text-muted-foreground text-sm text-center border border-border">
                    📖 Solo lectura - Hacé clic en <strong>"Iniciar"</strong> para
                    atender esta conversación
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-border bg-card">
                  <div className="p-3 rounded-lg bg-warning/20 text-warning text-sm text-center border border-warning">
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
