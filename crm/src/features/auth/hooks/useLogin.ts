import { useState } from 'react'
import { useAuthStore } from '../store'

export function useLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (testEmail: string) => {
    setEmail(testEmail)
    setError('')
    setIsLoading(true)

    try {
      await login(testEmail, 'any')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    password,
    error,
    isLoading,
    setEmail,
    setPassword,
    handleSubmit,
    handleQuickLogin,
  }
}
