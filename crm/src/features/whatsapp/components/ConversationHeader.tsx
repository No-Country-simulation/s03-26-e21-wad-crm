import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ConversationHeaderProps } from '../types'

export function ConversationHeader({ conversation, onBack }: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
        )}
        
        <div className="relative">
          <Avatar className="size-10">
            <AvatarFallback>
              {conversation.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          {conversation.isOnline && (
            <div className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-card" />
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {conversation.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {conversation.isOnline ? 'En línea' : 'Última vez hace 2 horas'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Phone className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Video className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreVertical className="size-5" />
        </Button>
      </div>
    </div>
  )
}
