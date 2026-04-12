import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavItem } from '../types'
import { WhatsAppSearch } from './WhatsAppSearch'
import { WhatsAppConversationList } from './WhatsAppConversationList'
import { WhatsAppOptions, WhatsAppTabs } from './WhatsAppOptions'
import { Conversation } from '../types'

interface WhatsAppSidebarContentProps {
  parentItem: NavItem
  conversations: Conversation[]
  onBack?: () => void
  onConversationClick: (conversation: Conversation) => void
  activeConversationId?: string
  searchQuery: string
  onSearchChange: (query: string) => void
  isMobile: boolean
}

export function WhatsAppSidebarContent({
  parentItem,
  conversations,
  onBack,
  onConversationClick,
  activeConversationId,
  searchQuery,
  onSearchChange,
  isMobile,
}: WhatsAppSidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="size-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </Button>
        )}
        <span className="text-sm font-medium truncate">{parentItem.label}</span>
      </div>

      <WhatsAppSearch value={searchQuery} onChange={onSearchChange} />

      <div className="flex-1 min-h-0">
        <WhatsAppTabs
          isMobile={isMobile}
          conversationsContent={
            <WhatsAppConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onConversationClick={onConversationClick}
              isMobile={isMobile}
            />
          }
          optionsContent={<WhatsAppOptions isMobile={isMobile} />}
        />
      </div>
    </div>
  )
}
