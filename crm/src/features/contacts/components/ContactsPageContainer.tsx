import { useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { LoadingSpinner } from '@/shared/ui/loading-spinner'
import { PageHeader } from '@/shared/components/page-header'
import { EmptyState } from '@/shared/components/empty-state'
import { Plus } from 'lucide-react'
import { useContacts } from '../hooks/useContacts'
import { ContactCard } from './ContactCard'
import { ContactsSearchBar } from './ContactsSearchBar'
import { ContactsFilter } from './ContactsFilter'

export function ContactsPageContainer() {
  const {
    filteredContacts,
    isLoading,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    fetchContacts,
  } = useContacts()

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Contactos"
        subtitle={`${filteredContacts.length} contactos encontrados`}
        actions={
          <Button>
            <Plus className="w-4 h-4" />
            Nuevo Contacto
          </Button>
        }
      />

      <div className="flex gap-4">
        <ContactsSearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />
        <ContactsFilter 
          statusFilter={statusFilter} 
          onFilterChange={setStatusFilter} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </div>

      {filteredContacts.length === 0 && <EmptyState message="No se encontraron contactos" />}
    </div>
  )
}
