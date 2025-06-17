'use client'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
} 