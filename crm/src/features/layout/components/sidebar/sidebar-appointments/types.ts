export interface AppointmentsSubNavData {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}