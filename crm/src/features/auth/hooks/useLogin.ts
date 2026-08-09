import { useState } from 'react'
import { useAuthStore } from '../store'

export function useLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoadingForm, setIsLoadingForm] = useState(false)
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoadingForm(true)

    try {
      await login(email, password)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoadingForm(false)
    }
  }

  const handleQuickLogin = async (testEmail: string) => {
    setEmail(testEmail)
    setError('')
    setIsLoadingForm(true)

    try {
      await login(testEmail, 'password123')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoadingForm(false)
    }
  }

  return {
    email,
    password,
    error,
    isLoadingForm,
    setEmail,
    setPassword,
    handleSubmit,
    handleQuickLogin,
  }
}
