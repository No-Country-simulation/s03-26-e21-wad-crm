import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils'
import { Check, CheckCheck } from 'lucide-react'
import { MessageBubbleProps } from '../types'

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex',
        message.direction === 'outbound' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          message.direction === 'outbound'
            ? 'bg-green-600 text-white rounded-br-md'
            : 'bg-card text-card-foreground rounded-bl-md border border-border'
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div className={cn(
          'flex items-center justify-end gap-1 mt-1',
          message.direction === 'outbound' ? 'text-green-100' : 'text-muted-foreground'
        )}>
          <span className="text-[10px]">
            {formatDistanceToNow(message.timestamp)}
          </span>
          {message.direction === 'outbound' && (
            message.status === 'read' ? (
              <CheckCheck className="size-3" />
            ) : (
              <Check className="size-3" />
            )
          )}
        </div>
      </div>
    </div>
  )
}
