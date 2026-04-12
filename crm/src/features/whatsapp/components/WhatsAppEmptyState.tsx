import { Card } from '@/components/ui/card'
import type { EmptyStateProps } from '../types'

export function WhatsAppEmptyState({ message, description }: EmptyStateProps) {
  return (
    <Card className="m-6 p-8">
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground mb-2">📱 {message}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </Card>
  )
}
