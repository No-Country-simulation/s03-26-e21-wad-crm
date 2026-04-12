import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ContactsFilterProps, CONTACT_STATUS_OPTIONS } from '../types'

export function ContactsFilter({ statusFilter, onFilterChange }: ContactsFilterProps) {
  return (
    <Select value={statusFilter} onValueChange={onFilterChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtrar por estado" />
      </SelectTrigger>
      <SelectContent>
        {CONTACT_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
