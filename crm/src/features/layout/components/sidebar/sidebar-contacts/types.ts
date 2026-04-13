export interface ContactsSubNavData {
  // TODO: Add contacts-specific data
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}