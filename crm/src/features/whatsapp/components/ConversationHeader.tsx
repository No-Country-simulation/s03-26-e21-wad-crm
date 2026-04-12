import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationHeaderProps } from '../types'

export function ConversationHeader({ conversation, onBack }: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
            {conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {conversation.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-900" />
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {conversation.name}
          </h3>
          <p className="text-xs text-slate-500">
            {conversation.isOnline ? 'En línea' : 'Última vez hace 2 horas'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
