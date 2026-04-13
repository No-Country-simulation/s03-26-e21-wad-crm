import { useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

interface SubNavSearchInputProps {
  collapsed: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onExpandAndFocus?: () => void
}

export function SubNavSearchInput({ 
  collapsed, 
  value, 
  onChange, 
  placeholder = 'Buscar...',
  onExpandAndFocus 
}: SubNavSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!collapsed && inputRef.current) {
      inputRef.current.focus()
    }
  }, [collapsed])

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground hover:text-green-600 hover:border hover:border-green-600/50 relative group"
            onClick={onExpandAndFocus}
          >
            <Search className="size-4" data-icon="inline-start" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {placeholder}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="relative px-1 py-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-9 text-sm"
      />
    </div>
  )
}