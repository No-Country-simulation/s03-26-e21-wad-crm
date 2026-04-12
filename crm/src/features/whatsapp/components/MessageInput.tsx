import { Send, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMessageInput } from '../hooks/useMessageInput'
import { MessageInputProps } from '../types'

export function MessageInput({ onSend }: MessageInputProps) {
  const { message, setMessage, handleSend, handleKeyPress } = useMessageInput({ onSend })

  return (
    <div className="px-4 py-3 border-t border-border bg-card">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Paperclip className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Smile className="size-5" />
        </Button>
        <Input 
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-muted"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button 
          size="icon" 
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
