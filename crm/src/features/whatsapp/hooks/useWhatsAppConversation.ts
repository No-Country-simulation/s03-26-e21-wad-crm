import { useState } from 'react'
import { ConversationData, Message } from '../types'
import { MOCK_MESSAGES } from '../mocks'

interface UseWhatsAppConversationReturn {
  messages: Message[]
  sendMessage: (content: string) => void
}

export function useWhatsAppConversation(
  conversation: ConversationData
): UseWhatsAppConversationReturn {
  const [messages, setMessages] = useState<Message[]>(
    conversation.messages.length > 0 ? conversation.messages : MOCK_MESSAGES
  )

  const sendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      direction: 'outbound',
      timestamp: new Date(),
      status: 'sent',
    }
    setMessages(prev => [...prev, newMessage])
  }

  return {
    messages,
    sendMessage,
  }
}
