import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { useLogin } from '../hooks/useLogin'
import { LoginForm } from './LoginForm'
import { QuickLoginButtons } from './QuickLoginButtons'

export function LoginPageContainer() {
  const {
    email,
    password,
    error,
    isLoading,
    setEmail,
    setPassword,
    handleSubmit,
    handleQuickLogin,
  } = useLogin()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Nexo CRM</CardTitle>
          <CardDescription className="text-center">
            Ingresá tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm
            email={email}
            password={password}
            error={error}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />

          <QuickLoginButtons
            isLoading={isLoading}
            onQuickLogin={handleQuickLogin}
          />
        </CardContent>
      </Card>
    </div>
  )
}
