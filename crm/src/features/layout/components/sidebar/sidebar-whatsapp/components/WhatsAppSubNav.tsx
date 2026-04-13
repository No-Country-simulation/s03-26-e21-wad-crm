import { Separator } from '@/components/ui/separator'
import type { SidebarSubNavProps, WhatsAppSubNavData } from '../../types'
import { SubNavBackButton, SubNavSearchInput } from '../../shared'
import { ConversationItem } from './ConversationItem'

export function WhatsAppSubNav({ 
  collapsed, 
  onBack, 
  data 
}: SidebarSubNavProps) {
  const {
    conversations = [],
    activeConversationId,
    onConversationClick,
    searchQuery = '',
    onSearchChange,
    onExpandAndFocus,
  } = (data as WhatsAppSubNavData) ?? {}

  if (collapsed) {
    return (
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        <SubNavBackButton collapsed={collapsed} onBack={onBack} />

        <Separator className="my-2" />

        <SubNavSearchInput
          collapsed={collapsed}
          value={searchQuery}
          onChange={onSearchChange ?? (() => {})}
          onExpandAndFocus={onExpandAndFocus}
        />

        <div className="flex flex-col gap-1 mt-2">
          {conversations.slice(0, 5).map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              collapsed={true}
              onClick={() => onConversationClick?.(conversation)}
            />
          ))}
        </div>
      </nav>
    )
  }

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 flex flex-col gap-1">
      <SubNavBackButton collapsed={collapsed} onBack={onBack} label="WhatsApp" />

      <Separator className="my-2" />

      <SubNavSearchInput
        collapsed={collapsed}
        value={searchQuery}
        onChange={onSearchChange ?? (() => {})}
      />

      <Separator className="my-2" />

      <div className="flex flex-col gap-1 mt-2">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={activeConversationId === conversation.id}
            collapsed={false}
            onClick={() => onConversationClick?.(conversation)}
          />
        ))}
      </div>
    </nav>
  )
}