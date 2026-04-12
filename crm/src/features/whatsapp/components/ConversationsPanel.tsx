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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

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
    <Card className="overflow-hidden bg-sidebar text-sidebar-foreground" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      <div className="flex h-full">
        {/* ── Left Sidebar: Conversations List ── */}
        <div className="w-80 border-r border-border flex flex-col bg-sidebar">
          <CardHeader className="bg-sidebar border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
                <MessageCircle className="size-4 text-green-600" />
                Conversaciones
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchConversations()}
                disabled={isLoadingConversations}
                className="h-7 px-2 text-xs bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
              >
                {isLoadingConversations ? '...' : '↻'}
              </Button>
            </div>
          </CardHeader>

          {error && (
            <Alert variant="destructive" className="mx-3 mt-3">
              <AlertDescription className="text-xs">❌ {error}</AlertDescription>
            </Alert>
          )}

          <ScrollArea className="flex-1">
            {conversations.length === 0 && !isLoadingConversations && (
              <div className="flex items-center justify-center py-8">
                <span className="text-muted-foreground text-sm">Sin conversaciones</span>
              </div>
            )}

            {conversations.map(conv => {
              const info = getContactInfo(conv.contactId)
              const isSelected = selectedConv === conv.id

              return (
                <Button
                  key={conv.id}
                  variant="ghost"
                  onClick={() => fetchMessages(conv.id)}
                  className={cn(
                    'w-full justify-start h-auto p-3 border-b border-border rounded-none text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isSelected && 'bg-green-600/20 text-green-600 dark:text-green-400 border-l-2 border-l-green-600'
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="size-10 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          conv.channel === 'WHATSAPP'
                            ? 'bg-green-600 text-white'
                            : 'bg-primary text-primary-foreground'
                        )}
                      >
                        {info.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-sidebar-foreground truncate">
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
                        <Badge
                          variant={conv.channel === 'WHATSAPP' ? 'default' : 'secondary'}
                          className={cn(
                            'text-xs px-1.5 py-0.5 flex-shrink-0 ml-2',
                            conv.channel === 'WHATSAPP' && 'bg-green-600/20 text-green-600 hover:bg-green-600/30'
                          )}
                        >
                          {conv.channel === 'WHATSAPP' ? 'WA' : 'EM'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </ScrollArea>
        </div>

        {/* ── Right Panel: Messages ── */}
        <div className="flex-1 flex flex-col bg-sidebar">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center bg-sidebar">
              <div className="text-center bg-sidebar">
                <MessageCircle className="size-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sidebar-foreground text-lg">Seleccioná una conversación</p>
                <p className="text-muted-foreground text-sm mt-1">Elegí un contacto de la lista izquierda</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
          <CardHeader className="bg-sidebar border-b border-border p-4">
                <div className="flex items-center gap-3 justify-between">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 h-auto p-0 hover:opacity-80"
                    onClick={() => {
                      setSelectedContact(
                        selectedConvData?.contactId
                          ? contacts[selectedConvData.contactId]
                          : null
                      )
                      setShowContactPanel(true)
                    }}
                  >
                    <Avatar className="size-10">
                      <AvatarFallback
                        className={cn(
                          selectedConvData?.channel === 'WHATSAPP'
                            ? 'bg-green-600 text-white'
                            : 'bg-primary text-primary-foreground'
                        )}
                      >
                        {selectedContactInfo?.name?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-left">
                      <p className="text-sm font-semibold text-sidebar-foreground">
                        {selectedContactInfo?.name || 'Contacto'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedContactInfo?.phone ||
                          selectedContactInfo?.email ||
                          ''}
                      </p>
                    </div>
                  </Button>

                  {/* Botón Iniciar/Cerrar */}
                  {!lockStatus?.isAttending ? (
                    <Button
                      onClick={startAttending}
                      className="bg-green-600 text-white hover:bg-green-500"
                      size="sm"
                    >
                      🟢 Iniciar
                    </Button>
                  ) : lockStatus?.agentId === crmConfig?.userId ? (
                    <Button
                      onClick={stopAttending}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600/40 text-red-300 border border-red-600/50 hover:bg-red-600/50"
                    >
                      🔴 Cerrar
                    </Button>
                  ) : null}
                </div>
              </CardHeader>

              {/* Banner - solo mostrar si está siendo atendida por OTRO agente */}
              {lockStatus?.isAttending && lockStatus?.agentId !== crmConfig?.userId && (
                <Alert className="rounded-none border-x-0 border-t-0 bg-warning/20 border-warning">
                  <Activity className="size-5" />
                  <AlertDescription className="flex items-center gap-2 text-warning text-sm">
                    <span className="font-medium">🔒 Atendiendo: {lockStatus.agentName}</span>
                    <span className="text-xs ml-auto">Solo lectura</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Messages area */}
              <ScrollArea className="flex-1 p-4 bg-sidebar">
                <div className="space-y-3 bg-sidebar text-sidebar-foreground">
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
                        className={cn(
                          'flex',
                          msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-md px-4 py-2.5 rounded-2xl text-sm',
                            msg.direction === 'OUTBOUND'
                              ? 'bg-green-600 text-white rounded-br-md'
                              : 'bg-muted text-foreground rounded-bl-md'
                          )}
                        >
                          <MessageContent message={msg} />

                          <div
                            className={cn(
                              'flex items-center justify-end gap-2 mt-1 text-xs',
                              msg.direction === 'OUTBOUND'
                                ? 'text-green-100'
                                : 'text-muted-foreground'
                            )}
                          >
                            <span>{formatMsgTime(msg.sentAt)}</span>

                            {msg.status && msg.direction === 'OUTBOUND' && (
                              <span>
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
              </ScrollArea>

              {/* Message Input - Solo mostrar si YO estoy atendiendo */}
              {lockStatus?.isAttending && lockStatus?.agentId === crmConfig?.userId ? (
                <CardContent className="bg-sidebar p-4 pt-6">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Escribí un mensaje..."
                      rows={1}
                      className="resize-none min-h-[40px] max-h-[120px]"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={api.loading || !newMessage.trim() || !selectedConv}
                      className="bg-green-600 text-white hover:bg-green-500"
                    >
                      {api.loading ? '◷' : '→'}
                    </Button>
                  </div>
                </CardContent>
              ) : !lockStatus?.isAttending ? (
                <CardContent className="bg-sidebar p-4 pt-6">
                  <Alert>
                    <AlertDescription className="text-sm text-center">
                      📖 Solo lectura - Hacé clic en <strong>"Iniciar"</strong> para
                      atender esta conversación
                    </AlertDescription>
                  </Alert>
                </CardContent>
              ) : (
                <CardContent className="bg-sidebar p-4 pt-6">
                  <Alert className="bg-warning/20 border-warning">
                    <AlertDescription className="text-warning text-sm text-center">
                      🔒 Atendido por: <strong>{lockStatus?.agentName}</strong>
                      <br />
                      <span className="text-xs">Esperá a que cierre la atención</span>
                    </AlertDescription>
                  </Alert>
                </CardContent>
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
    </Card>
  )
}

export default ConversationsPanel
