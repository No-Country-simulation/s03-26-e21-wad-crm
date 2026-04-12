import { useWhatsAppPage } from '../hooks/useWhatsAppPage'
import { ConversationsPanel } from './ConversationsPanel'
import { SendPanel } from './SendPanel'
import { WhatsAppEmptyState } from './WhatsAppEmptyState'

export function WhatsAppPageContainer() {
  const {
    selectedConversationId,
    setSelectedConversationId,
    isLoading,
  } = useWhatsAppPage()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white overflow-hidden">
        <ConversationsPanel 
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </div>

      {/* Send Panel */}
      <div className="w-2/3 overflow-hidden">
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
