export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  jobTitle?: string
  companyId?: string
  status: ContactStatus
  tags?: string[]
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export type ContactStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'

export interface ContactsPageProps {
  onContactClick?: (contact: Contact) => void
}

export interface ContactCardProps {
  contact: Contact
  onClick?: () => void
}

export interface ContactsSearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export interface ContactsFilterProps {
  statusFilter: string
  onFilterChange: (value: string) => void
}

export const CONTACT_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'NEW', label: 'Nuevo' },
  { value: 'CONTACTED', label: 'Contactado' },
  { value: 'QUALIFIED', label: 'Calificado' },
  { value: 'CONVERTED', label: 'Convertido' },
  { value: 'LOST', label: 'Perdido' },
] as const
