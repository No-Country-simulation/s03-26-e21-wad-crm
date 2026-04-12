import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface WhatsAppSearchProps {
  value: string
  onChange: (query: string) => void
}

export function WhatsAppSearch({ value, onChange }: WhatsAppSearchProps) {
  return (
    <div className="p-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar conversación..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>
    </div>
  )
}
