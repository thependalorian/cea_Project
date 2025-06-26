'use client'

/**
 * Protected Route Component
 * Purpose: Protect routes that require authentication
 * Location: /components/ProtectedRoute.tsx
 */
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useEffect } from 'react'
import { Spinner } from './shared/Spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If authentication is not loading and user is not authenticated, redirect to login
    if (!isLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // If user is authenticated, render the children
  return user ? <>{children}</> : null
} 