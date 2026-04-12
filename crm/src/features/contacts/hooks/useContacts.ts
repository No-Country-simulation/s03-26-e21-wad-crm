import { useState, useMemo } from 'react'
import { useContactsStore } from '../store'
import { Contact } from '../types'

interface UseContactsReturn {
  contacts: Contact[]
  isLoading: boolean
  searchTerm: string
  statusFilter: string
  filteredContacts: Contact[]
  setSearchTerm: (value: string) => void
  setStatusFilter: (value: string) => void
  fetchContacts: () => void
}

export function useContacts(): UseContactsReturn {
  const { contacts, isLoading, fetchContacts } = useContactsStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
      return matchesSearch && matchesStatus && !contact.isDeleted
    })
  }, [contacts, searchTerm, statusFilter])

  return {
    contacts,
    isLoading,
    searchTerm,
    statusFilter,
    filteredContacts,
    setSearchTerm,
    setStatusFilter,
    fetchContacts,
  }
}
