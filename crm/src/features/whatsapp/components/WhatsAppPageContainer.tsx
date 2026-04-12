import { useWhatsAppPage } from '../hooks/useWhatsAppPage'
import { ConversationsPanel } from './ConversationsPanel'
import { SendPanel } from './SendPanel'
import { WhatsAppEmptyState } from './WhatsAppEmptyState'
import { Skeleton } from '@/components/ui/skeleton'

export function WhatsAppPageContainer() {
  const {
    selectedConversationId,
    setSelectedConversationId,
    isLoading,
  } = useWhatsAppPage()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="size-12 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-background">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border bg-sidebar overflow-hidden">
        <ConversationsPanel 
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Send Panel */}
      <div className="w-2/3 overflow-hidden bg-sidebar">
        {selectedConversationId ? (
          <SendPanel 
            conversationId={selectedConversationId}
            config={undefined}
            templates={[]}
            crmConfig={undefined}
          />
        ) : (
          <WhatsAppEmptyState 
            message="Selecciona una conversación"
            description="Elige un chat de la lista para empezar"
          />
        )}
      </div>
    </div>
  )
}
