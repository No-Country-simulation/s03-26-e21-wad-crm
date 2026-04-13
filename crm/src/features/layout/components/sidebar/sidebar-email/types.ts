export interface EmailSubNavData {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}