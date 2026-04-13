import { ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Conversation } from './types'
import { cn } from '@/lib/utils'
import { useRef, useEffect } from 'react'

interface WhatsAppSubNavProps {
  conversations: Conversation[]
  onBack: () => void
  onConversationClick: (conversation: Conversation) => void
  activeConversationId?: string
  searchQuery: string
  onSearchChange: (query: string) => void
  isMobile: boolean
  collapsed: boolean
  onExpandAndFocus?: () => void
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Ayer'
  } else if (days < 7) {
    return date.toLocaleDateString('es-ES', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }
}

function ConversationItem({
  conversation,
  isActive,
  collapsed,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}) {
  const initials = conversation.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-10 relative group hover:text-green-600 hover:border hover:border-green-600/50"
        onClick={onClick}
      >
        {conversation.unreadCount && conversation.unreadCount > 0 ? (
          <div className="relative">
            <Avatar className="size-8">
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback className="size-8 text-xs bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -top-1 -left-1 size-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          </div>
        ) : (
          <Avatar className="size-8">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className="size-8 text-xs bg-muted">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-popover text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border shadow-md">
          {conversation.name}
        </div>
      </Button>
    )
  }

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
        isActive && 'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50',
        !isActive && 'text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50'
      )}
      onClick={onClick}
    >
      <Avatar className="size-8 flex-shrink-0">
        <AvatarImage src={conversation.avatar} alt={conversation.name} />
        <AvatarFallback className="size-8 text-xs bg-muted">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium truncate">{conversation.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatTimestamp(conversation.timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground truncate">
            {conversation.lastMessage}
          </span>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <span className="size-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>

      {isActive && (
        <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
      )}
    </Button>
  )
}

export function WhatsAppSubNav({
  conversations,
  onBack,
  collapsed,
  searchQuery,
  onSearchChange,
  onExpandAndFocus,
  activeConversationId,
  onConversationClick,
}: WhatsAppSubNavProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!collapsed && inputRef.current) {
      inputRef.current.focus()
    }
  }, [collapsed])

  if (collapsed) {
    return (
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        <Button
          variant="secondary"
          className={cn(
            'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
            'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
          )}
          onClick={onBack}
        >
          <ChevronRight className="size-4 flex-shrink-0 rotate-180" data-icon="inline-start" />
          <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-popover text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border shadow-md">
            WhatsApp
          </div>
          <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
        </Button>

        <Separator className="my-2" />

        <Button
          variant="ghost"
          size="icon"
          className="size-10 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50 relative group"
          onClick={onExpandAndFocus}
        >
          <Search className="size-4" data-icon="inline-start" />
          <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-popover text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border shadow-md">
            Buscar
          </div>
        </Button>

        <div className="flex flex-col gap-1 mt-2">
          {conversations.slice(0, 5).map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              collapsed={true}
              onClick={() => onConversationClick(conversation)}
            />
          ))}
        </div>
      </nav>
    )
  }

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1">
      <Button
        variant="secondary"
        className={cn(
          'w-full justify-start gap-3 px-3 py-2.5 h-auto relative group',
          'bg-green-600/20 text-green-600 dark:text-green-400 border border-green-600/50'
        )}
        onClick={onBack}
      >
        <ChevronRight className="size-4 flex-shrink-0 rotate-180" data-icon="inline-start" />
        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-medium truncate">WhatsApp</span>
        </div>
        <div className="absolute right-0 w-1 h-6 rounded-l-full bg-green-500 flex-shrink-0" />
      </Button>

      <Separator className="my-2" />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <Separator className="my-2" />

      <div className="flex flex-col gap-1 mt-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={activeConversationId === conversation.id}
            collapsed={false}
            onClick={() => onConversationClick(conversation)}
          />
        ))}
      </div>
    </nav>
  )
}
