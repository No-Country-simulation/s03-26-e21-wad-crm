import { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { MessageInputProps } from '../types'

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      onSend(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <Paperclip className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <Smile className="w-5 h-5" />
        </Button>
        <Input 
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border-0"
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
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
