import { useWhatsAppPage } from '../hooks/useWhatsAppPage'
import { ConversationsPanel } from './ConversationsPanel'
import { SendPanel } from './SendPanel'
import { WhatsAppEmptyState } from './WhatsAppEmptyState'
import { Skeleton } from '@/components/ui/skeleton'

export function WhatsAppPageContainer() {
  const {
    selectedConversationId,
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
    <div className="w-full h-full overflow-hidden">
      <ConversationsPanel />
    </div>
  )
}
