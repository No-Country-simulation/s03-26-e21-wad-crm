import { useState, useEffect } from 'react'
import { useWhatsAppStore } from '@/store/whatsappStore'

export function useWhatsAppPage() {
  const { selectedConversationId, setSelectedConversationId } = useWhatsAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  return {
    selectedConversationId,
    setSelectedConversationId,
    isLoading,
  }
}
