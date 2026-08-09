import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { useAuthStore } from '../store'
import { useLogin } from '../hooks/useLogin'
import { LoginForm } from './LoginForm'
import { QuickLoginButtons } from './QuickLoginButtons'

export function LoginPageContainer() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  // Auto-redirect si auth success
  useEffect(() => {
    console.log('🔄 LoginPageContainer effect:', { isAuthenticated, isLoading }) // DEBUG
    if (isAuthenticated && !isLoading) {
      console.log('✅ Auth success, redirecting to dashboard') // DEBUG
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  const {
    email,
    password,
    error,
    isLoadingForm,
    setEmail,
    setPassword,
    handleSubmit,
    handleQuickLogin,
  } = useLogin()

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md border border-input shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-card-foreground">Nexo CRM</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Ingresá tus credenciales para acceder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm
            email={email}
            password={password}
            error={error}
            isLoading={isLoadingForm}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
          />

          <QuickLoginButtons
            isLoading={isLoadingForm}
            onQuickLogin={handleQuickLogin}
          />

          <div className="pt-4 border-t border-input text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                Registrate
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}