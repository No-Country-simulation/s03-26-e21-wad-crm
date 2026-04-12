import { Input } from '@/shared/ui/input'
import { Search } from 'lucide-react'
import { ContactsSearchBarProps } from '../types'

export function ContactsSearchBar({ searchTerm, onSearchChange }: ContactsSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder="Buscar por nombre o email..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}
