import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Conversation } from '../types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils'

interface WhatsAppConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export function WhatsAppConversationItem({ conversation, isActive, onClick }: WhatsAppConversationItemProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start h-auto py-3 px-3 gap-3',
        isActive
          ? 'bg-green-600/10 border border-green-600/30'
          : 'hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="size-10">
          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
            {conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        {conversation.isOnline && (
          <div className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            'text-sm font-medium truncate',
            isActive ? 'text-green-700 dark:text-green-400' : 'text-foreground'
          )}>
            {conversation.name}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(conversation.timestamp)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {conversation.lastMessage}
        </p>
      </div>

      {conversation.unreadCount ? (
        <Badge className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-green-500 text-white text-xs font-medium flex items-center justify-center px-1.5">
          {conversation.unreadCount}
        </Badge>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 size-8 opacity-0 group-hover:opacity-100 hover:bg-muted"
        >
          <MoreVertical className="size-4 text-muted-foreground" />
        </Button>
      )}
    </Button>
  )
}

interface WhatsAppConversationListProps {
  conversations: Conversation[]
  activeConversationId?: string
  onConversationClick: (conversation: Conversation) => void
  isMobile: boolean
}

export function WhatsAppConversationList({
  conversations,
  activeConversationId,
  onConversationClick,
  isMobile,
}: WhatsAppConversationListProps) {
  if (isMobile) {
    return (
      <ScrollArea className="h-full">
        <div className="px-3 pb-3">
          <Accordion type="single" collapsible defaultValue="conversations">
            <AccordionItem value="conversations" className="border-none">
              <AccordionTrigger className="py-2 text-sm hover:no-underline">
                Conversaciones ({conversations.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-1">
                  {conversations.map((conversation) => (
                    <WhatsAppConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={activeConversationId === conversation.id}
                      onClick={() => onConversationClick(conversation)}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="px-3 py-2 flex flex-col gap-1">
        {conversations.map((conversation) => (
          <WhatsAppConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={activeConversationId === conversation.id}
            onClick={() => onConversationClick(conversation)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
