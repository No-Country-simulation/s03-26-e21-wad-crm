import { WhatsAppConversationProps } from '../types'
import { useWhatsAppConversation } from '../hooks/useWhatsAppConversation'
import { ConversationHeader } from './ConversationHeader'
import { ConversationMessages } from './ConversationMessages'
import { MessageInput } from './MessageInput'

export function WhatsAppConversationContainer({ conversation, onBack }: WhatsAppConversationProps) {
  const { messages, sendMessage } = useWhatsAppConversation(conversation)

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <ConversationMessages messages={messages} conversation={conversation} />
      <MessageInput onSend={sendMessage} />
    </div>
  )
}

export function WhatsAppConversationHeader({ conversation, onBack }: WhatsAppConversationProps) {
  return <ConversationHeader conversation={conversation} onBack={onBack} />
}
