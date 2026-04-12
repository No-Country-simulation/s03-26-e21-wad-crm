import { useState } from 'react'

interface UseMessageInputProps {
  onSend: (message: string) => void
}

export function useMessageInput({ onSend }: UseMessageInputProps) {
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

  return {
    message,
    setMessage,
    handleSend,
    handleKeyPress,
  }
}
