export interface TasksSubNavData {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}