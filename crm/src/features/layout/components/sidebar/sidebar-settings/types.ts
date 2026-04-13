export interface SettingsSubNavData {
  searchQuery: string
  onSearchChange: (query: string) => void
  onExpandAndFocus?: () => void
}