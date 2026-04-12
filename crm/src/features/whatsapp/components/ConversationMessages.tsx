import { ScrollArea } from '@/components/ui/scroll-area'
import { Message, ConversationData } from '../types'
import { MessageBubble } from './MessageBubble'

interface ConversationMessagesProps {
  messages: Message[]
  conversation: ConversationData
}

export function ConversationMessages({ messages }: ConversationMessagesProps) {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  )
}
