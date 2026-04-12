import { Card } from '@/shared/ui/card'
import type { EmptyStateProps } from '../types'

export function WhatsAppEmptyState({ message, description }: EmptyStateProps) {
  return (
    <Card className="m-6 p-8">
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-gray-500 mb-2">📱 {message}</p>
        {description && (
          <p className="text-sm text-gray-400">{description}</p>
        )}
      </div>
    </Card>
  )
}
