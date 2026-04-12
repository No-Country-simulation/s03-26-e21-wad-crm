export interface LoginFormData {
  email: string
  password: string
}

export interface LoginFormProps {
  email: string
  password: string
  error: string
  isLoading: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export interface QuickLoginButtonsProps {
  isLoading: boolean
  onQuickLogin: (email: string) => void
}

export const TEST_USERS = [
  { email: 'admin@nexo.com', label: 'Admin' },
  { email: 'manager@nexo.com', label: 'Manager' },
  { email: 'agent@nexo.com', label: 'Agent' },
  { email: 'viewer@nexo.com', label: 'Viewer' },
]
