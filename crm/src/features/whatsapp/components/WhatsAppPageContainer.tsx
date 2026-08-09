import { useEffect, useState } from 'react'
import { useWhatsAppPage } from '../hooks/useWhatsAppPage'
import { ConversationsPanel } from './ConversationsPanel'
import { SendPanel } from './SendPanel'
import { WhatsAppEmptyState } from './WhatsAppEmptyState'
import { Skeleton } from '@/components/ui/skeleton'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

interface CrmConfig {
  token?: string
  baseUrl?: string
  userId?: string
}

export function WhatsAppPageContainer() {
  const {
    selectedConversationId,
    isLoading,
  } = useWhatsAppPage()

  const [crmConfig, setCrmConfig] = useState<CrmConfig>({
    token: undefined,
    baseUrl: API_BASE_URL,
    userId: undefined,
  })

  useEffect(() => {
    const token = localStorage.getItem('crm_access_token')
    const userStr = localStorage.getItem('crm_user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setCrmConfig({
          token,
          baseUrl: API_BASE_URL,
          userId: user.id,
        })
      } catch (err) {
        console.error('Error parsing user:', err)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="size-12 rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <ConversationsPanel crmConfig={crmConfig} />
    </div>
  )
}
