import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils'
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
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-700'
        )}
      >
        <p className="text-sm">{message.content}</p>
        <div className={cn(
          'flex items-center justify-end gap-1 mt-1',
          message.direction === 'outbound' ? 'text-green-100' : 'text-slate-400'
        )}>
          <span className="text-[10px]">
            {formatDistanceToNow(message.timestamp)}
          </span>
          {message.direction === 'outbound' && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
              {message.status === 'read' ? (
                <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.97 4.97z"/>
              ) : (
                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7l-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"/>
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
