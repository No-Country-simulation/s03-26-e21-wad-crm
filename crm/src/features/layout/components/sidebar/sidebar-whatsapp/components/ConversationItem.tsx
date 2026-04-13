import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { WhatsAppConversation } from '../types'

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

interface ConversationItemProps {
  conversation: WhatsAppConversation
  isActive: boolean
  collapsed: boolean
  onClick: () => void
}

export function ConversationItem({
  conversation,
  isActive,
  collapsed,
  onClick,
}: ConversationItemProps) {
  const initials = conversation.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
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
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {conversation.name}
        </TooltipContent>
      </Tooltip>
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