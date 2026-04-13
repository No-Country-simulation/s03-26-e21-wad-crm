/**
 * ConversationsPanel - Panel de conversaciones de WhatsApp
 *
 * Features:
 * - Lista de conversaciones con información de contacto
 * - Historial de mensajes con auto-scroll
 * - Estado de atención (lock multi-agente)
 * - Auto-polling cada 10 segundos (via usePolling)
 * - Integración con panel de información de contacto
 * - Retry automático (via useWhatsAppApi)
 *
 * @requires shadcn/ui: Card, Button, ScrollArea, Avatar, Badge, Textarea, Alert
 * @requires hooks: useConversationsPanel, useWhatsAppApi
 */

import { MessageCircle, Activity, Send, RefreshCw } from 'lucide-react'
import { ContactInfoPanel } from './ContactInfoPanel'
import { useConversationsPanel } from '../hooks/useConversationsPanel'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import type { Message, ContactInfo } from '../types'

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

export function ConversationsPanel({ config, crmConfig }: ConversationsPanelProps) {
  const {
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
    isLoadingConversations,
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
    formatMsgTime,
    getMessageStatusIcon,
  } = useConversationsPanel({ config, crmConfig })

  const getContactInfo = (contactId: string): ContactInfo => {
    const c = contacts[contactId]
    if (!c) return { id: contactId, name: 'Contacto', phone: '', email: '' }
    return c
  }

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

  return (
    <div className="w-full h-full flex overflow-hidden bg-background">
      <div className="w-80 border-r flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="size-4 text-green-600" />
              Conversaciones
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchConversations()}
              disabled={isLoadingConversations}
              className="h-7 px-2 text-xs"
            >
              {isLoadingConversations ? '...' : <RefreshCw className="size-3" />}
            </Button>
          </div>
        </div>

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
                    'w-full justify-start h-auto p-3 border-b rounded-none hover:bg-accent',
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
                        <span className="text-sm font-medium truncate">
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

      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="size-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg">Seleccioná una conversación</p>
              <p className="text-muted-foreground text-sm mt-1">Elegí un contacto de la lista izquierda</p>
            </div>
          </div>
        ) : (
          <Card className="flex flex-col flex-1 border-0 rounded-none">
            <CardHeader className="border-b p-4">
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
                    <p className="text-sm font-semibold">
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
                      onClick={() => startAttending()}
                      className="bg-green-600 text-white hover:bg-green-500"
                      size="sm"
                    >
                      🟢 Iniciar
                    </Button>
                  ) : lockStatus?.agentId === crmConfig?.userId ? (
                    <Button
                      onClick={() => stopAttending()}
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
            <ScrollArea className="flex-1 p-4 overflow-hidden">
              <div className="space-y-3">
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
              <CardContent className="p-4 pt-6 border-t flex-shrink-0">
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
                    disabled={isLoadingConversations || !newMessage.trim() || !selectedConv}
                    className="bg-green-600 text-white hover:bg-green-500"
                  >
                    {isLoadingConversations ? '◷' : <Send className="size-4" />}
                  </Button>
                </div>
              </CardContent>
            ) : !lockStatus?.isAttending ? (
              <CardContent className="p-4 pt-6 border-t flex-shrink-0">
                <Alert>
                  <AlertDescription className="text-sm text-center">
                    📖 Solo lectura - Hacé clic en <strong>"Iniciar"</strong> para
                    atender esta conversación
                  </AlertDescription>
                </Alert>
              </CardContent>
            ) : (
              <CardContent className="p-4 pt-6 border-t flex-shrink-0">
                <Alert className="bg-warning/20 border-warning">
                  <AlertDescription className="text-warning text-sm text-center">
                    🔒 Atendido por: <strong>{lockStatus?.agentName}</strong>
                    <br />
                    <span className="text-xs">Esperá a que cierre la atención</span>
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        )}
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
